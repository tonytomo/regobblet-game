<script lang="ts">
	import Modal from '#lib/components/ui/Modal.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { onlineStore } from '#lib/stores/onlineStore.svelte.js';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import { settingsStore } from '#lib/stores/settingsStore.svelte.js';

	interface Props {
		isOpen: boolean;
		onclose: () => void;
	}

	let { isOpen, onclose }: Props = $props();

	let roomCodeInput = $state<string>('');
	let serverUrlInput = $state<string>(onlineStore.serverUrl);
	let isCopied = $state<boolean>(false);
	let isActionPending = $state<boolean>(false);

	const isConnected = $derived(onlineStore.isConnected);
	const isConnecting = $derived(onlineStore.isConnecting);
	const currentRoom = $derived(onlineStore.currentRoom);
	const selfRole = $derived(onlineStore.selfRole);
	const isOpponentPresent = $derived(onlineStore.isOpponentPresent);
	const error = $derived(onlineStore.error);

	async function handleCreateRoom() {
		isActionPending = true;
		try {
			onlineStore.setServerUrl(serverUrlInput);
			settingsStore.setServerUrl(serverUrlInput);
			await onlineStore.createRoom(gameStore.state.config);
		} catch {
			// error is set in store
		} finally {
			isActionPending = false;
		}
	}

	async function handleJoinRoom() {
		if (!roomCodeInput.trim()) return;
		isActionPending = true;
		try {
			onlineStore.setServerUrl(serverUrlInput);
			settingsStore.setServerUrl(serverUrlInput);
			await onlineStore.joinRoom(roomCodeInput.trim().toLowerCase());
		} catch {
			// error is set in store
		} finally {
			isActionPending = false;
		}
	}

	async function handleLeaveRoom() {
		await onlineStore.leaveRoom();
		gameStore.setGameMode('ai');
	}

	function handleCopyCode() {
		if (!currentRoom) return;
		navigator.clipboard.writeText(currentRoom).then(() => {
			isCopied = true;
			setTimeout(() => (isCopied = false), 2000);
		});
	}
</script>

<Modal {isOpen} title="Online Multiplayer · Gosocket" maxWidth="md" {onclose}>
	<div class="flex flex-col gap-4 py-1 text-xs">
		<!-- Server Configuration -->
		<div class="border-stone-850 flex flex-col gap-1 rounded-xl border bg-stone-950 p-3">
			<label
				for="ws-server-endpoint"
				class="text-[11px] font-bold tracking-wider text-stone-400 uppercase"
			>
				WebSocket Server Endpoint
			</label>
			<div class="flex items-center gap-2">
				<input
					id="ws-server-endpoint"
					type="text"
					bind:value={serverUrlInput}
					placeholder="ws://localhost:18080/ws"
					class="border-stone-750 w-full rounded-lg border bg-stone-900 px-3 py-1.5 font-mono text-xs text-stone-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
				/>
				<div class="flex shrink-0 items-center gap-1.5">
					<span
						class="h-2.5 w-2.5 rounded-full {isConnected
							? 'bg-emerald-500'
							: isConnecting
								? 'animate-ping bg-amber-500'
								: 'bg-rose-500'}"
					></span>
					<span class="text-[10px] font-medium text-stone-400">
						{isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Offline'}
					</span>
				</div>
			</div>
			<p class="mt-1 text-[10px] text-stone-400">
				Powered by @tonytomo/gosocket-client. Runs on Universal WebSocket Server.
			</p>
		</div>

		{#if error}
			<div
				class="flex items-center gap-2 rounded-xl border border-rose-800/80 bg-rose-950/60 p-2.5 text-xs text-rose-300"
			>
				<svg
					class="h-4 w-4 shrink-0 text-rose-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		{#if currentRoom}
			<!-- Active Room Lobby -->
			<div
				class="bg-stone-850 border-stone-750 flex flex-col items-center gap-3 rounded-2xl border p-4 text-center"
			>
				<Badge variant={selfRole === 1 ? 'player1' : 'player2'} size="md">
					You are Player {selfRole} ({selfRole === 1 ? 'Host' : 'Guest'})
				</Badge>

				<div class="flex flex-col items-center gap-1">
					<span class="text-[11px] font-bold tracking-wider text-stone-400 uppercase"
						>Room Code</span
					>
					<div class="flex items-center gap-2">
						<span
							class="border-stone-750 rounded-xl border bg-stone-950 px-3 py-1 font-mono text-2xl font-black tracking-widest text-amber-400"
						>
							{currentRoom}
						</span>
						<Button variant="secondary" size="sm" onclick={handleCopyCode}>
							{isCopied ? 'Copied!' : 'Copy'}
						</Button>
					</div>
				</div>

				<div class="mt-1 flex items-center gap-2 text-stone-300">
					<span
						class="h-2 w-2 rounded-full {isOpponentPresent
							? 'bg-emerald-400'
							: 'animate-ping bg-amber-400'}"
					></span>
					<span>
						{isOpponentPresent
							? 'Opponent connected! Game ready.'
							: 'Waiting for opponent to join...'}
					</span>
				</div>

				<div class="mt-2 flex w-full items-center gap-2">
					<Button variant="danger" size="sm" class="w-full" onclick={handleLeaveRoom}>
						Leave Room
					</Button>
				</div>
			</div>
		{:else}
			<!-- Room Actions: Create or Join -->
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<!-- Create Room -->
				<div
					class="bg-stone-850 border-stone-750 flex flex-col justify-between gap-3 rounded-2xl border p-3.5"
				>
					<div>
						<h4 class="text-sm font-bold text-stone-100">Host New Room</h4>
						<p class="mt-1 text-xs text-stone-400">
							Create a room with your active board settings ({gameStore.state.config
								.size}×{gameStore.state.config.size}).
						</p>
					</div>
					<Button variant="primary" size="md" disabled={isActionPending} onclick={handleCreateRoom}>
						{isActionPending ? 'Creating...' : 'Create Room'}
					</Button>
				</div>

				<!-- Join Room -->
				<div
					class="bg-stone-850 border-stone-750 flex flex-col justify-between gap-3 rounded-2xl border p-3.5"
				>
					<div>
						<h4 class="text-sm font-bold text-stone-100">Join Room</h4>
						<p class="mt-1 text-xs text-stone-400">
							Enter the 6-character room code from your friend.
						</p>
					</div>
					<div class="flex flex-col gap-2">
						<input
							type="text"
							bind:value={roomCodeInput}
							placeholder="e.g. rg-a1b2c3"
							class="border-stone-750 w-full rounded-lg border bg-stone-900 px-3 py-1.5 font-mono text-xs text-stone-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500"
						/>
						<Button
							variant="accent"
							size="md"
							disabled={isActionPending || !roomCodeInput.trim()}
							onclick={handleJoinRoom}
						>
							{isActionPending ? 'Joining...' : 'Join Game'}
						</Button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="secondary" size="md" onclick={onclose}>Close</Button>
	{/snippet}
</Modal>
