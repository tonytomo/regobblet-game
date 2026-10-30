# @tonytomo/gosocket-client (`gosocket-client`)

Browser-first TypeScript / JavaScript client SDK for the Universal WebSocket Server (Complete SDK: Phases J1, J2, J3 & J4).

This SDK runs natively in modern web browsers (HTML5 `WebSocket`) with **zero runtime dependencies**, providing robust connection lifecycle management, browser query-based authentication, exponential backoff reconnection with full jitter, automatic serialized session restoration, heartbeat liveness checks, a two-lane outbound pipeline with rate limiting, coalescing, and backpressure, binary channel multiplexing, presence cache with reconnect invalidation, sequence-gap detection, comprehensive protocol error classification, local pre-send validation, capability pre-flight checks, and ping/RTT tracking.

---

## Table of Contents

- [Browser constraints](#browser-constraints)
- [Browser auth — why a heuristic](#browser-auth--why-a-heuristic)
- [Reconnect policy](#reconnect-policy)
- [Session restore](#session-restore)
- [Outbound pipeline](#outbound-pipeline)
- [Coalescing](#coalescing)
- [Rate limiting — cooperative, not authoritative](#rate-limiting--cooperative-not-authoritative)
- [Backpressure](#backpressure)
- [Reconnect discards queues](#reconnect-discards-queues)
- [Capabilities](#capabilities)
- [Binary channels](#binary-channels)
- [Presence — a hint, not a source of truth](#presence--a-hint-not-a-source-of-truth)
- [Sequence gaps — what reliable means](#sequence-gaps--what-reliable-means)
- [Reconnect invalidates presence and re-baselines seq](#reconnect-invalidates-presence-and-re-baselines-seq)
- [Browser binary behavior](#browser-binary-behavior)
- [Error classification & recovery policy](#error-classification--recovery-policy)
- [Round-trip time (RTT) & ping API](#round-trip-time-rtt--ping-api)
- [Local validation vs. server validation](#local-validation-vs-server-validation)
- [Capability pre-flight checks](#capability-pre-flight-checks)
- [What the SDK does _not_ do](#what-the-sdk-does-not-do)
- [Usage Guide](#usage-guide)
- [Live Conformance](#live-conformance)

---

## Browser constraints

The browser runtime imposes three fundamental constraints that distinguish this SDK from server-side clients (such as the Go SDK):

1. **No `Authorization` HTTP header on native `WebSocket`**:
   The W3C / WHATWG `WebSocket` browser API does not allow setting custom HTTP request headers during the WebSocket upgrade handshake. Server-to-server clients can send `Authorization: Bearer <key>`, but browser clients **must** pass their credentials using the URL query parameter (`?key=<token>`). There is intentionally no `Authorization` header path in this package.

2. **No HTTP status code visibility on failed upgrades**:
   If the WebSocket upgrade request fails (for instance, when the server rejects an invalid API key with `HTTP 401 Unauthorized`), the browser security sandbox masks the HTTP response code and response body. The native JavaScript `WebSocket` instance simply triggers an `error` event followed immediately by a `close` event with code `1006` (`StatusAbnormalClosure`) and an empty reason string. Network drops, DNS errors, TLS handshake failures, and HTTP 401 rejections all appear identically to JavaScript.

3. **No native fake timer or transport injection**:
   Browser environments lack built-in mechanisms to pause, step, or mock time and network sockets without polluting global prototypes. To support fast, deterministic, reproducible testing without flaky wall-clock sleeps, this SDK abstracts the system clock (`Clock`) and network layer (`Transport`). All internal timers schedule through `Clock`, and production instances default to `RealClock` and `BrowserWebSocketTransport`.

> [!WARNING]
> **Event Handler Isolation**:
> Reader and writer event dispatches are synchronous and run on the main JavaScript event loop. Do not perform long-running, blocking, or CPU-heavy work inside SDK event listeners; the SDK provides no worker thread isolation, and slow listeners will delay protocol handling and writer execution.

---

## Browser auth — why a heuristic

Because the browser hides the HTTP 401 status code behind an ambiguous abnormal closure (`close` code `1006`), the SDK must determine whether a connection drop is an authentication failure (which should **never** auto-reconnect to avoid spamming the server and getting rate-limited or locked out) or a transient network glitch (which **should** auto-reconnect).

The SDK implements an authentication heuristic mirrored from the reference Go SDK:

### Default Heuristic (`'heuristic'`)

- If the socket closes with code `1006` **before** the initial `welcome` frame has been received on the very first connect attempt, the SDK classifies the failure as `AUTH_FAILED`.
- The client emits a `fatal` event with `{ code: 'AUTH_FAILED', message: '...' }`, transitions to `closed`, and does **not** attempt automatic reconnection.
- Once the first successful `welcome` frame has arrived in a session, subsequent `1006` closures are recognized as mid-stream disconnects and will trigger automatic reconnection.
- The heuristic state is reset whenever `client.close()` is called followed by a fresh `client.connect()`.

### Alternative Auth Failure Modes

You can configure `authFailureMode` in `ClientConfig`:

- `'heuristic'` (default): Treat pre-welcome `1006` on the first attempt as `AUTH_FAILED`.
- `'never-fatal'`: Never classify a pre-welcome `1006` as an authentication failure. Reconnect backoff will always engage. Useful when connecting over notoriously unstable networks where initial drops are common and the caller accepts the cost of retry loops.
- `'always-fatal'`: Treat **any** pre-welcome close (regardless of close code) on the first attempt as an authentication failure. Useful in controlled production environments with reliable networking where handshake failure indicates invalid credentials.

### Ambiguous Auth Escape Hatch (`onAmbiguousAuth`)

If your application requires custom classification logic, provide an `onAmbiguousAuth` callback:

```ts
const client = new Client({
	url: 'wss://example.com/ws',
	apiKey: 'k_alice_123',
	onAmbiguousAuth: (closeCode, reason) => {
		// Return 'fatal' to abort immediately or 'retry' to engage reconnection
		return closeCode === 1006 ? 'fatal' : 'retry';
	}
});
```

---

## Reconnect policy

The SDK automatically recovers dropped connections using **full-jitter exponential backoff** identical to the wire protocol reference:

$$\text{backoff} = \min(\text{maxDelayMs}, \text{baseDelayMs} \times 2^{\text{attempt}})$$
$$\text{delay} = \text{random}(0, \text{backoff})$$

### Default Configuration

- `baseDelayMs`: `500` ms
- `maxDelayMs`: `30000` ms (30 s)
- `maxAttempts`: `Infinity`
- `jitter`: `'full'` (also supports `'equal'` and `'none'`)

### Reconnect Triggers

Automatic reconnection engages on:

- `1006` (Abnormal Closure, post-welcome or in `'never-fatal'` mode)
- `1001` (Going Away, indicating server graceful shutdown recovery per PROTOCOL.md §9.2)
- `1000` (Unexpected normal closure initiated by the server without prior client `close()`)
- Transport errors mid-stream
- Heartbeat ping/pong deadline timeouts

### Non-Reconnect (Fatal) Triggers

Reconnection is **halted** and state transitions to `closed` on:

- Explicit caller termination via `client.close()`
- `1008` (Policy Violation, such as rate abuse, reliable queue overflow, or server read timeouts) — surfaces `fatal` with `{ code: 'POLICY_VIOLATION' }`
- Initial handshake classification of `AUTH_FAILED`
- Exhaustion of `maxAttempts` (emits `fatal` with `{ code: 'CLOSED' }`)
- Custom rejection via `shouldReconnect({ closeCode, firstConnect })` returning `false`

The attempt counter resets to `0` upon each successful `welcome` frame.

---

## Session restore

The SDK automatically restores room memberships following connection recovery without re-transmitting business traffic.

### In-Memory Only

> [!IMPORTANT]
> **No Local Storage Persistence**:
> Room intents and authentication credentials exist **in memory only**. The SDK intentionally never writes API keys, passcodes, or room states to `localStorage`, `sessionStorage`, or `IndexedDB`. If the user navigates away or refreshes the page, all state is lost and must be re-initialized.

### Serialized Execution

The wire protocol contains no multiplexed request correlation identifiers. Because of this:

- **The session restore loop is strictly serialized**: The client issues `join_room` for intent $N$, waits for the server's `room_joined` confirmation (or error), and only then sends `join_room` for intent $N+1$.
- Parallel restore joins are forbidden to prevent protocol race conditions.
- On recovery, room intents are sorted alphabetically by room name to ensure deterministic order across connections.

### Per-Intent Recovery Outcomes

When rejoining each room on reconnect:

- `room_joined` $\rightarrow$ Membership restored.
- `ROOM_NOT_FOUND` $\rightarrow$ Intent deleted from memory, emits `intentFailed{ room, code: 'ROOM_NOT_FOUND' }`.
- `FORBIDDEN_SCOPE` $\rightarrow$ Intent deleted from memory, emits `intentFailed{ room, code: 'FORBIDDEN_SCOPE' }`.
- `INVALID_PASSCODE` / `PASSCODE_RATE_LIMITED` $\rightarrow$ Intent kept in memory, emits `intentFailed`, skipped for the remainder of this reconnect cycle.
- `ROOM_FULL` $\rightarrow$ Controlled by `restore.roomFullPolicy`:
  - `'drop'` (default): Intent dropped from memory, emits `intentFailed{ room, code: 'ROOM_FULL' }`.
  - `'retry'`: Retries up to 3 times with exponential backoff and jitter. If still full after 3 attempts, intent is kept for future reconnect cycles.
- Per-room timeout (`restorePerRoomTimeoutMs: 5000`) $\rightarrow$ Emits `intentFailed`, intent is kept.

When the restore loop finishes, the client emits `sessionRestored` with `{ restored: string[], failed: Array<{ room, code }> }`.

---

## Outbound pipeline

Phase J2 replaces direct socket writing with a prioritised two-lane async outbound pipeline mirroring the server delivery semantics in PROTOCOL.md §5.4:

```
                  publish(req)
                       │
             ┌─────────┴─────────┐
             │ Channel Policy    │
             │ Rate Limit Check  │
             └─────────┬─────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[Reliable Lane]                [Unreliable Lane]
(FIFO, cap: 256)               (FIFO, cap: 16)
       │                               │
       │                               ├── Coalescing (optional)
       │                               ▼
       └───────────────┬───────────────┘
                       │
             [Writer Pump Loop]
         (Priority: Reliable 32,
          Unreliable 8; Backpressure check)
                       │
                       ▼
             [WebSocket.send()]
```

### Lane Characteristics

1. **Reliable Lane (`reliable: true`)**:
   - Default buffer capacity: `256` frames.
   - Enforces strict FIFO ordering.
   - **Overflow Behavior**: Controlled by `outbound.reliableOverflow`:
     - `'drop'` (default): Drops the **newest** frame admitted, keeping older frames intact to preserve chronological delivery. Emits `reliableOverflow{ action: 'dropped', depth }`.
     - `'close'`: Emits `reliableOverflow{ action: 'closed' }` and immediately terminates the WebSocket connection with status code `1008` (`reliable queue overflow`), triggering a `fatal` policy violation event.
2. **Unreliable Lane (`reliable: false`)**:
   - Default buffer capacity: `16` frames.
   - Designed for high-frequency state updates where fresher data replaces stale data.
   - **Overflow Behavior**: Drops the **oldest** frame in the queue to admit the newest frame. Emits `unreliableDropped{ depth }`.

### Writer Loop Scheduling

Because browsers lack background writer goroutines, the writer is driven by an async pump loop running on the event loop:

- Drains up to `reliableBurst` (default: 32) frames from the reliable lane.
- Drains up to `unreliableBurst` (default: 8) frames from the unreliable lane or coalesce slots.
- Performs a microtask yield (`await Promise.resolve()`) per frame to avoid blocking UI rendering or starve incoming WebSocket frames.
- If the browser transport is blocked by backpressure or the connection is not in `ready` state, the writer pauses cooperatively until unblocked.

---

## Coalescing

On unreliable channels opted in via `policy.coalesce = true`, rapid updates sent before the transport flushes are coalesced into a single slot instead of consuming FIFO slots.

### Drivers: `'timer'` vs. `'raf'`

- `'timer'` (default): Drains on the next microtask turn. Suitable for general high-frequency state streams and maintains behavioral parity with the Go SDK.
- `'raf'` (`requestAnimationFrame`): Browser-native driver that aligns outbound state flushes with the monitor refresh rate (typically 60 Hz or 120 Hz). All state updates generated within an animation frame are coalesced into one wire transmission. In Node or test environments where `requestAnimationFrame` is undefined, the SDK falls back to a 16 ms timer scheduled via `Clock`.

### Merge Semantics (`merge`)

By default, the newest update replaces the previous pending update (last-writer-wins). Applications can supply a custom `merge` function to combine or filter updates:

```ts
const policy: ChannelPolicy = {
	reliable: false,
	maxRate: 0,
	coalesce: true,
	coalesceDriver: 'raf',
	merge: (prev: unknown, next: unknown) => {
		const p = prev as { x: number; y: number; seq: number };
		const n = next as { x: number; y: number; seq: number };
		if (n.seq < p.seq) {
			// Out-of-order frame: skip new update
			return { value: prev, skip: true };
		}
		// Return accumulated or latest value
		return { value: next, skip: false };
	}
};
```

- If `skip: true`, the new message is discarded and the previous message is retained in the slot, emitting `coalesced{ merged: false, skipped: true }`.
- If `skip: false`, `value` replaces the slot and `coalesced{ merged: true, skipped: false }` is emitted.
- Flipping a channel's policy to `coalesce: false` via `setChannelPolicy` immediately flushes any pending slot as an individual write without emitting a `coalesced` event.

---

## Rate limiting — cooperative, not authoritative

Rate limiting is enforced locally per `(room, channel)` using an exact client-side token bucket matching the server algorithm in PROTOCOL.md §5.5:

- **Rate**: `maxRate` tokens per second.
- **Burst Capacity**: $\max(2, \text{maxRate} \times 2)$.
- `maxRate = 0` bypasses rate limiting (unlimited).

### Role of the Client Limiter

The client-side limiter is **cooperative, not authoritative**. Its primary role is to intercept excess outbound traffic before it hits the wire, preventing the client from accumulating rate violations that would cause the server to forcibly terminate the connection with code `1008` (`rate limit abuse`).

### Local vs. Server Events

- `rateLimited{ source: 'local', room, channel, retryAfterMs }`: Emitted when the local token bucket is exhausted or during an active server-instructed pause. The `publish()` call rejects locally with a `RateLimitedError`.
- `rateLimited{ source: 'server', room, channel, retryAfterMs }`: Emitted when the server returns an `error` frame with code `RATE_LIMITED`. The SDK pauses local publishing on that channel for the instructed duration (`retry_after_ms`, typically 250 ms).

---

## Backpressure

Unlike server-side runtimes, web browsers expose `WebSocket.bufferedAmount`—the byte count of queued data in the browser's internal network buffer. If the client publishes faster than the socket can transmit over the network, `bufferedAmount` will grow unboundedly.

The SDK monitors backpressure cooperatively:

- **High Water Mark (`highWaterMarkBytes`, default $1 \text{ MiB}$)**: When `bufferedAmount >= highWaterMarkBytes`, the writer pauses unreliable lane draining and emits `backpressure{ state: 'high', bufferedAmount }`.
- **Low Water Mark (`lowWaterMarkBytes`, default $512 \text{ KiB}$)**: When `bufferedAmount <= lowWaterMarkBytes`, backpressure clears, `backpressure{ state: 'low', bufferedAmount }` is emitted, and the writer resumes.
- **Hysteresis**: Fluctuations between the low and high thresholds do not trigger flapping events.
- **Debugging**: If you encounter unexpected message drops or pauses, monitor `client.queueDepth()` and `client.bufferedAmount()`. Operators with high-throughput state streams over fast networks can adjust `highWaterMarkBytes` and `lowWaterMarkBytes` in `ClientConfig.backpressure`.

---

## Reconnect discards queues

Outbound queues and coalesce slots belong strictly to the active **connection generation**:

> [!IMPORTANT]
> **Rationale from Go SDK §4.4**:
> Post-reconnect room state may contradict messages buffered before disconnection (the app's view of the room is stale after a reconnect; buffering stale outbound traffic risks delivering messages that contradict restored state).
>
> On reconnect, all pending reliable, unreliable, and coalesced frames are discarded, and the SDK emits `queuesDiscarded{ reliable, unreliable, coalesced }` **before** the session restore cycle begins.
>
> Applications requiring durable or offline message queueing across page reloads or network drops should maintain an application-level buffer and flush after observing the `sessionRestored` event.

---

## Capabilities

Upon each successful connection, the server synchronously sends a `welcome` frame containing a `capabilities` descriptor advertising its runtime limits and supported features.

### S2 `null`-means-disabled Semantics

The SDK preserves the authoritative wire semantics from PROTOCOL.md §2.4 and S2:

- An integer value indicates an enforced maximum (e.g. `max_rooms: 1000`, `max_channels_per_room: 32`).
- A `null` value indicates that the limit is **explicitly disabled** (unlimited) by server configuration (e.g. `max_rooms_per_key: null`).
- `undefined` indicates that the connected server is a legacy version that does not advertise capabilities.

Capabilities are cached on `client.capabilities`. When a reconnect yields a different `server_version` or modified capabilities, the SDK emits `capabilitiesChanged`.

---

## Binary channels

Binary frames allow high-throughput, low-overhead transmission of packed binary data (such as physics snapshots, audio streams, or state deltas) without JSON serialization overhead (PROTOCOL.md §7).

### Wire Format & Mapping

- Wire format: `[channel_id: 1 byte][payload: N bytes]`.
- Channels map names to a 1-byte identifier in $[1, 254]$ (`0` is reserved for JSON control frames, and `255` is reserved for presence).
- Channel `"presence"` cannot be mapped to binary (`RESERVED_CHANNEL_NAME`).

### Builder Construction

Use `BinaryMapBuilder` to construct and validate mappings:

```ts
import { BinaryMapBuilder } from 'gosocket-client';

const binMap = new BinaryMapBuilder()
	.set('state', 1)
	.set('actions', 2)
	.autoSet('telemetry') // assigns smallest available ID (e.g. 3)
	.build();
```

Construction-time validation enforces:

- Channel name non-empty and `!= 'presence'`.
- ID integer in $[1, 254]$.
- No duplicate IDs and no duplicate channel names in the builder.
- Returns an immutable, frozen mapping object.

### Global Binary-ID Uniqueness Rule

Because the wire binary frame does not carry a room identifier, the client connection enforces global ID uniqueness across all rooms joined on that connection.

If room B attempts to map an ID already assigned to room A:

- `joinRoomWithBinary` rejects locally before touching the wire with `BinaryIdCollisionError`.
- Emits a `binaryIdCollision` event with `{ id, existing, rejected }`.

### Update via Re-Join

Calling `joinRoomWithBinary` on an already-joined room updates that room's binary mappings in place (`PROTOCOL.md` §3.2). IDs removed by the update are freed from `binaryOwner`, and newly added IDs are reserved. If the server rejects the join (e.g. `ROOM_NOT_FOUND`), tentative reservations are rolled back to the previous state.

### Binary Publishing & Coalescing

Use `client.publishBinary({ room, channel, payload })`:

- Payloads can be passed as `ArrayBuffer` or `Uint8Array`.
- Routes through the channel's resolved policy (`reliable` vs `unreliable`).
- Shares the same token-bucket rate limiter and server `RATE_LIMITED` backoff with text messages on that channel.
- On coalesced unreliable channels (`coalesce: true`), binary publishes update slot `${room}:${channel}:binary`. Text and binary messages on the same channel maintain distinct slots and never overwrite each other. Binary coalescing operates in last-wins mode.
- Configurable maximum payload size via `maxBinaryPayloadBytes` (default 65,535 bytes). Oversize payloads reject immediately with `BinaryPayloadTooLargeError`.

---

## Presence — a hint, not a source of truth

Room presence is managed automatically on the reserved `"presence"` channel (PROTOCOL.md §6).

> [!IMPORTANT]
> **Presence Caveats**:
>
> - **Presence is a best-effort hint, not an authoritative source of truth.**
> - Peers who joined before the current client joined are not visible in `knownMembers(room)` (the server sends `room_joined.members` count, but does not replay prior peer joins).
> - Peers who left while this client was disconnected or reconnecting may still appear in `knownMembers(room)` until `resetPresence(room)` or room departure.
> - The protocol does not provide an application-level roster sync. Applications requiring authoritative user rosters must perform their own sync over an application channel.

### Presence Inspection & APIs

- `client.selfLabel`: The connection's unique client label assigned in `welcome.label`.
- `client.knownMembers(room)`: Sorted array of peer labels observed joining since the last `resetPresence`, with `selfLabel` excluded.
- `client.lastServerMemberCount(room)`: Last member count from `room_joined.members`, adjusted by subsequent `presenceJoin` (+1) and `presenceLeave` (-1) events. Returns `{ count: number, ok: boolean }`.
- `client.presenceInvalidated(room)`: `true` if connection drop marked the cache stale.
- `client.resetPresence(room)`: Clears the `known` roster and invalidation flag while keeping `lastServerMemberCount`.

### Typed Events

- `presenceJoin`: `{ room, who }`
- `presenceLeave`: `{ room, who }`
- `presenceInvalidated`: `{ room, reason }`
- `roomDeleted`: `{ room, who }`

---

## Sequence gaps — what reliable means

The server sequences messages monotonically via a per-`(room, channel)` `seq` counter (PROTOCOL.md §5.6).

### Anomalous vs Expected

- **Reliable Channels (`reliable: true`)**: Every sequence number must arrive contiguously without gaps ($1, 2, 3\dots$). A forward jump ($s > \text{last} + 1$) indicates dropped frames due to network error or server buffer eviction, emitting `sequenceGap` with `reliable: true`.
- **Unreliable Channels (`reliable: false`)**: Frame loss is expected under network saturation or client rate limiting. Forward jumps emit `sequenceGap` with `reliable: false` for application telemetry.
- **Re-baselining**: Reconnections, backward sequence numbers (e.g. room re-creation), duplicate sequence numbers, and unsequenced frames (`seq = 0`) silently establish or maintain baseline without emitting false gap alarms.
- **Auto-invalidation**: Configure `presence: { autoInvalidateOnReliableGap: true }` to automatically mark a room's presence cache invalidated when a sequence gap occurs on the reliable `"presence"` channel.

---

## Reconnect invalidates presence and re-baselines seq

When a connection disconnects and reconnects:

1. **Queues Discarded**: Outbound queues are purged to avoid sending stale commands.
2. **Presence Invalidated**: Before session restore begins, every live room intent is marked `presenceInvalidated(room) == true` with reason `"reconnected"`, and emits a `presenceInvalidated` event. The known roster is kept for inspection until `client.resetPresence(room)` is called.
3. **Seq Re-baselined**: All sequence baselines are cleared (`hasBase = false`). The first message received on each channel after reconnect silently sets a fresh baseline.
4. **Session Restored**: Surviving rooms rejoin; if a room is dropped (e.g. `ROOM_NOT_FOUND`), all room state (`binaryOwner`, `presence`, `seq`, `rateLimiters`) is completely evicted via `clearRoomState`.

---

## Browser binary behavior

In web browsers, the standard HTML5 `WebSocket` defaults to `binaryType = 'blob'`. Converting `Blob` payloads requires asynchronous `blob.arrayBuffer()` calls that cause microtask queue delays and GC overhead.

This SDK automatically sets:

```ts
this.ws.binaryType = 'arraybuffer';
```

Inbound binary messages arrive synchronously as `ArrayBuffer` instances and are decoded without microtask lag into `Uint8Array` payloads on `binaryMessage` events.

---

## Usage Guide

### Installation

```bash
npm install gosocket-client
```

### Complete Example (Lifecycle, Binary, Presence, Policies)

```ts
import { Client, BinaryMapBuilder, presetsFor } from 'gosocket-client';

const client = new Client({
	url: 'wss://your-server.example.com/ws',
	apiKey: 'k_alice_123',
	heartbeat: { intervalMs: 25000, timeoutMs: 10000 },
	reconnect: { baseDelayMs: 500, maxDelayMs: 30000 },
	presence: { autoInvalidateOnReliableGap: true },
	outbound: {
		reliableQueueSize: 256,
		unreliableQueueSize: 16,
		policyProvider: {
			channelPolicy: (room, channel) => presetsFor('game')[channel]
		}
	}
});

// Binary channel mapping
const binMap = new BinaryMapBuilder().set('state', 1).set('actions', 2).build();

// Inbound binary frames
client.on('binaryMessage', ({ room, channel, payload }) => {
	// payload is a Uint8Array
	console.log(`Binary frame on ${room}/${channel} (${payload.byteLength} bytes)`);
});

// Presence events
client.on('presenceJoin', ({ room, who }) => {
	console.log(`Peer ${who} joined ${room}`);
	console.log('Known roster:', client.knownMembers(room));
});

client.on('presenceLeave', ({ room, who }) => {
	console.log(`Peer ${who} left ${room}`);
});

// Sequence gaps
client.on('sequenceGap', (ev) => {
	console.warn(
		`Sequence gap on ${ev.room}/${ev.channel}: missed ${ev.missed} frames (reliable: ${ev.reliable})`
	);
});

// Connect and join with binary
await client.connect();
await client.joinRoomWithBinary({
	room: 'arena-1',
	binaryChannels: binMap
});

// Publish binary state at 60 Hz (unreliable lane)
await client.publishBinary({
	room: 'arena-1',
	channel: 'state',
	payload: new Uint8Array([0x01, 0x02, 0x03])
});

// Clean room deletion
await client.deleteRoom('arena-1');
```

---

## Error classification & recovery policy

The SDK maps all 18 protocol error codes from `PROTOCOL.md` §4.7 into standardized recovery actions (`fatal`, `drop_intent`, `app_prompt`, `retry_backoff`, `ignore`):

### Recovery Decision Table

| Error Code              | Action          | Default Retry Delay                | Application Recovery Guidance                     |
| :---------------------- | :-------------- | :--------------------------------- | :------------------------------------------------ |
| `UNAUTHORIZED`          | `fatal`         | —                                  | Halt connection; prompt user for valid API key    |
| `FORBIDDEN_SCOPE`       | `fatal`         | —                                  | Halt connection; API key lacks required scope     |
| `NOT_ROOM_OWNER`        | `drop_intent`   | —                                  | Discard intent; caller cannot manage room         |
| `BAD_REQUEST`           | `drop_intent`   | —                                  | Discard intent; fix malformed request syntax      |
| `ROOM_NOT_FOUND`        | `drop_intent`   | —                                  | Discard intent; room does not exist               |
| `ROOM_ALREADY_EXISTS`   | `app_prompt`    | —                                  | Prompt user or generate alternate room name       |
| `INVALID_PASSCODE`      | `app_prompt`    | —                                  | Prompt user to enter correct passcode             |
| `ROOM_FULL`             | `retry_backoff` | 1000 ms                            | Wait for member departure; retry join             |
| `PASSCODE_RATE_LIMITED` | `retry_backoff` | `retry_after_ms` (fallback 60 s)   | Pause passcode entry until lockout window expires |
| `MAX_ROOMS_REACHED`     | `retry_backoff` | 5000 ms                            | Wait or delete existing rooms                     |
| `BINARY_NOT_ALLOWED`    | `ignore`        | —                                  | Inform application; fallback to text frames       |
| `CHANNEL_NOT_RELIABLE`  | `ignore`        | —                                  | Unreliable channel cannot guarantee delivery      |
| `CHANNEL_NOT_FOUND`     | `ignore`        | —                                  | Channel not configured in room                    |
| `RESERVED_CHANNEL_NAME` | `ignore`        | —                                  | Reserved name (`presence`) cannot be used         |
| `CHANNEL_READ_ONLY`     | `ignore`        | —                                  | Channel is read-only                              |
| `RATE_LIMITED`          | `retry_backoff` | `retry_after_ms` (fallback 250 ms) | Back off outbound publishing                      |
| `INTERNAL_ERROR`        | `retry_backoff` | 2000 ms                            | Transient server issue; retry request             |

### `AUTH_FAILED` vs `UNAUTHORIZED`

Because native browser `WebSocket` obscures HTTP status codes on rejected handshakes (closing with code `1006` rather than providing `HTTP 401`), the SDK employs the auth heuristic:

1. When a pre-welcome `1006` occurs on first connect, the SDK emits `errorClassified { code: 'UNAUTHORIZED', action: 'fatal', rawFrame: undefined }`.
2. Immediately following `errorClassified`, it emits `fatal { code: 'AUTH_FAILED' }` and transitions to `closed`.

This preserves full parity with server-side SDKs that observe HTTP 401 directly, while providing browser applications with typed `errorClassified` signals.

### Policy Overrides

Applications can customize error classifications via `ClientConfig.errorPolicy.overrides`:

```ts
const client = new Client({
	url: 'wss://example.com/ws',
	apiKey: 'k_123',
	errorPolicy: {
		overrides: {
			INTERNAL_ERROR: { action: 'fatal' },
			ROOM_NOT_FOUND: { action: 'ignore' }
		}
	}
});
```

---

## Round-trip time (RTT) & ping API

### On-Demand Ping

Measure current connection round-trip latency at any time using `client.ping()`:

```ts
const rttMs = await client.ping(5000); // 5s timeout
console.log(`Ping round-trip: ${rttMs}ms`);
```

- Sends an application-level `{"type":"ping"}` frame and waits for `{"type":"pong"}`.
- Serialized to prevent concurrent ping interleaving.
- Rejects with `NotReadyError` if called while not in `ready` state.
- Rejects with `RequestTimeoutError` if pong does not arrive within deadline.

### Latency Statistics (`rttStats()`)

Get a snapshot of latency statistics over the active connection generation:

```ts
const stats = client.rttStats();
if (stats) {
	console.log(
		`Last: ${stats.last}ms, Min: ${stats.min}ms, Max: ${stats.max}ms, Mean: ${stats.mean.toFixed(1)}ms (${stats.samples} samples)`
	);
}
```

The `mean` latency is calculated as an exponential moving average (EMA) with smoothing factor $\alpha = 0.2$:
$$\text{mean}_{\text{new}} = 0.8 \times \text{mean}_{\text{old}} + 0.2 \times \text{sample}$$

Statistics reset to `undefined` on every reconnect cycle and client close.

### Passive Heartbeat RTT Sampling

Every background heartbeat ping/pong cycle automatically computes an RTT sample and updates latency stats. Opt out via `heartbeat: { trackRtt: false }`.

Both heartbeat and on-demand samples emit the `rtt` event:

```ts
client.on('rtt', ({ sample, source, stats }) => {
	console.log(`RTT [${source}]: ${sample}ms (avg ${stats.mean.toFixed(1)}ms)`);
});
```

---

## Local validation vs. server validation

The SDK provides fast, client-side pre-send validation to save network round-trips and provide immediate developer feedback:

| Constraint          | Validation Rule                                            | Checked On                                                                       | Error Thrown                                                       |
| :------------------ | :--------------------------------------------------------- | :------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| Room name syntax    | `^[a-zA-Z0-9_-]{1,64}$`                                    | `createRoom`, `joinRoom`, `deleteRoom`, `forgetRoom`, `publish`, `publishBinary` | `ValidationError` (`field: 'room'`, `rule: 'name_syntax'`)         |
| Channel name syntax | `^[a-zA-Z0-9_-]{1,32}$`                                    | `publish`, `publishBinary`                                                       | `ValidationError` (`field: 'channel'`, `rule: 'name_syntax'`)      |
| Reserved channel    | Cannot publish to `'presence'`                             | `publish`, `publishBinary`                                                       | `ValidationError` (`field: 'channel'`, `rule: 'reserved_channel'`) |
| Text payload size   | Marshaled bytes $\le 65024$ (leaving 512B envelope budget) | `publish`                                                                        | `ValidationError` (`field: 'payload'`, `rule: 'too_large'`)        |
| Binary payload size | Raw bytes $\le 65535$                                      | `publishBinary`                                                                  | `ValidationError` / `BinaryPayloadTooLargeError`                   |

### Bypassing Local Validation

- Set `validation: { enabled: false }` in `ClientConfig` to disable local validation and allow invalid frames to reach the wire for negative testing.
- Direct calls to `client.send(frame)` bypass local validation entirely.

---

## Capability pre-flight checks

Upon connecting, the server advertises its resource limits in `welcome.capabilities.limits`. The SDK performs local pre-flight validation on `createRoom()` calls before transmitting frames:

- **`max_metadata_bytes`**: Rejects metadata exceeding the server byte limit with `CapabilityLimitError`.
- **`max_channels_per_room`**: Computes effective room channels (preset channels $\cup$ custom channels $\cup$ `'presence'`) and rejects if greater than server limit.
- **`max_rooms_per_key`**: Tracks active rooms created by the client on the current connection and rejects additional room creation attempts before wire traffic.

Pre-flight checks fail synchronously before wire frames are dispatched and do **not** emit `errorClassified`. If a server does not advertise limits (or advertises `null`), checks pass through unconditionally.

---

## What the SDK does _not_ do

To preserve architectural clarity and adhere to browser constraints, the SDK explicitly does **not**:

1. **Send HTTP Headers on WebSocket**: The browser W3C API forbids setting custom HTTP headers on WebSocket handshakes; authentication is strictly query-parameter based (`?key=...`).
2. **Expose Failed Upgrade Status Codes**: Browsers do not reveal HTTP 401 response bodies to JavaScript; the SDK relies on its heuristic.
3. **Run Dedicated Writer Threads**: JavaScript is single-threaded; the SDK coordinates outbound writes via an async event loop pump yielding microtasks (`await Promise.resolve()`).
4. **Isolate Slow Event Handlers**: Callbacks registered on `client.on(...)` execute synchronously on the pump; slow handlers block the event loop.
5. **Act as an Authoritative Arbiter**: Client rate limiting and presence rosters are local cooperative hints; the server remains the authoritative source of truth.
6. **Reorder or Resend Packets on Sequence Gaps**: Sequence gap detection identifies dropped or out-of-order packets and emits `sequenceGap`, leaving resync policy to the application.

---

## Live Conformance

The SDK includes a comprehensive live conformance test suite running against real Go server instances using the `ws` library polyfill in Node.js.

### Running Live Conformance

```bash
# Run the complete live conformance suite
bash scripts/live-conformance-js.sh
```

The runner:

1. Compiles the Go server binary from `./cmd/server`.
2. Starts three isolated test server instances:
   - Primary server on port `18080` (full capabilities, rate limits, timeouts).
   - Binary-disabled server on port `18081` (`ALLOW_BINARY=false`).
   - Policy-violation server on port `18082` (`MAX_RATE_VIOLATIONS_PER_MINUTE=3`).
3. Executes the Vitest live suite in `test/live/`.
4. Performs graceful SIGTERM shutdown and verifies clean process exit.

## Documentation

- [Migrating from raw WebSocket](MIGRATION.md) — a phased swap for existing
  clients.
