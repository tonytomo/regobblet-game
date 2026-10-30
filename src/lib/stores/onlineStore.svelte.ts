import { Client, type MessageFrame } from '@tonytomo/gosocket-client';
import { variables } from '../../env.js';
import type { BoardConfig, MoveAction, PlayerId } from '#lib/types/game.js';
import type { WireMessage } from '#lib/types/online.js';
import { gameStore } from './gameStore.svelte.js';

export function createOnlineStore() {
	let client: Client | null = null;
	let isConnected = $state<boolean>(false);
	let isConnecting = $state<boolean>(false);
	let currentRoom = $state<string | null>(null);
	let selfRole = $state<PlayerId | null>(null);
	let isOpponentPresent = $state<boolean>(false);
	let error = $state<string | null>(null);
	let serverUrl = $state<string>('ws://localhost:18080/ws');

	// Attempt to initialize from env
	try {
		if (variables && variables.WS_URL && typeof variables.WS_URL === 'string') {
			serverUrl = variables.WS_URL;
		}
	} catch {
		// Use fallback
	}

	function handleInboundMessage(frame: MessageFrame): void {
		if (!frame.payload) return;

		let wireMsg: WireMessage;
		try {
			wireMsg =
				typeof frame.payload === 'string'
					? JSON.parse(frame.payload)
					: (frame.payload as WireMessage);
		} catch {
			return;
		}

		if (wireMsg.type === 'game_init') {
			// If we are guest, role is 2; if host, role is 1
			if (selfRole === 2) {
				gameStore.startNewGame(wireMsg.config, 'online');
			}
		} else if (wireMsg.type === 'move') {
			if (wireMsg.player !== selfRole) {
				gameStore.applyRemoteMove(wireMsg.action);
			}
		} else if (wireMsg.type === 'restart_request') {
			gameStore.resetCurrentGame();
		}
	}

	async function ensureConnected(targetUrl?: string): Promise<Client> {
		const url = targetUrl || serverUrl;
		if (client && isConnected) {
			return client;
		}

		isConnecting = true;
		error = null;

		try {
			client = new Client({
				url,
				apiKey: 'regobblet-client-key',
				heartbeat: { intervalMs: 25000, timeoutMs: 10000 },
				reconnect: { baseDelayMs: 500, maxDelayMs: 10000 },
				authFailureMode: 'never-fatal'
			});

			client.on('connected', () => {
				isConnected = true;
				isConnecting = false;
				error = null;
			});

			client.on('disconnected', () => {
				isConnected = false;
			});

			client.on('message', (frame) => {
				handleInboundMessage(frame);
			});

			client.on('presenceJoin', (ev) => {
				if (ev.room === currentRoom && ev.who !== client?.selfLabel) {
					isOpponentPresent = true;
				}
			});

			client.on('presenceLeave', (ev) => {
				if (ev.room === currentRoom && ev.who !== client?.selfLabel) {
					isOpponentPresent = false;
				}
			});

			client.on('error', (err) => {
				error = err.error?.message || 'Connection error';
			});

			await client.connect();
			isConnected = true;
			isConnecting = false;
			return client;
		} catch (err: unknown) {
			isConnecting = false;
			isConnected = false;
			error = err instanceof Error ? err.message : 'Failed to connect to server';
			throw err;
		}
	}

	return {
		get isConnected() {
			return isConnected;
		},
		get isConnecting() {
			return isConnecting;
		},
		get currentRoom() {
			return currentRoom;
		},
		get selfRole() {
			return selfRole;
		},
		get isOpponentPresent() {
			return isOpponentPresent;
		},
		get error() {
			return error;
		},
		get serverUrl() {
			return serverUrl;
		},

		setServerUrl(url: string) {
			serverUrl = url;
		},

		async createRoom(config: BoardConfig): Promise<string> {
			const cli = await ensureConnected();
			const code = 'rg-' + Math.random().toString(36).substring(2, 8);

			await cli.createRoom({
				room: code,
				channels: {
					game: { reliable: true, max_rate: 20 },
					chat: { reliable: true, max_rate: 5 }
				}
			});

			await cli.joinRoom({ room: code });
			currentRoom = code;
			selfRole = 1;
			isOpponentPresent = false;

			gameStore.startNewGame(config, 'online');
			return code;
		},

		async joinRoom(code: string): Promise<void> {
			const cli = await ensureConnected();
			await cli.joinRoom({ room: code });

			currentRoom = code;
			selfRole = 2;
			isOpponentPresent = true;

			// Request game init state from host
			await cli.publish({
				room: code,
				channel: 'game',
				payload: JSON.stringify({ type: 'guest_ready', sender: cli.selfLabel }),
				reliable: true
			});
		},

		async sendMove(action: MoveAction, player: PlayerId): Promise<void> {
			if (!client || !currentRoom) return;
			const msg: WireMessage = {
				type: 'move',
				action,
				player,
				seq: Date.now()
			};
			await client.publish({
				room: currentRoom,
				channel: 'game',
				payload: JSON.stringify(msg),
				reliable: true
			});
		},

		async sendRestart(): Promise<void> {
			if (!client || !currentRoom || !selfRole) return;
			const msg: WireMessage = {
				type: 'restart_request',
				from: selfRole
			};
			await client.publish({
				room: currentRoom,
				channel: 'game',
				payload: JSON.stringify(msg),
				reliable: true
			});
			gameStore.resetCurrentGame();
		},

		async leaveRoom(): Promise<void> {
			if (client && currentRoom) {
				try {
					await client.leaveRoom(currentRoom);
				} catch {
					// Ignore leave errors
				}
			}
			currentRoom = null;
			selfRole = null;
			isOpponentPresent = false;
		}
	};
}

export const onlineStore = createOnlineStore();
