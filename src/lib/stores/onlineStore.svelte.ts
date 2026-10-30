import { Client, type MessageFrame } from '@tonytomo/gosocket-client';
import { variables } from '../../env.js';
import type { BoardConfig, MoveAction, PlayerId } from '#lib/types/game.js';
import type { WireMessage } from '#lib/types/online.js';
import { gameStore } from './gameStore.svelte.js';
import { settingsStore } from './settingsStore.svelte.js';

export function createOnlineStore() {
	let client: Client | null = null;
	let lastConnectedUrl: string | null = null;
	let lastConnectedKey: string | null = null;

	let isConnected = $state<boolean>(false);
	let isConnecting = $state<boolean>(false);
	let currentRoom = $state<string | null>(null);
	let selfRole = $state<PlayerId | null>(null);
	let isOpponentPresent = $state<boolean>(false);
	let error = $state<string | null>(null);
	let serverUrl = $state<string>('ws://localhost:18080/ws');
	let apiKey = $state<string>(settingsStore.apiKey || '');

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

		if (wireMsg.type === 'guest_ready') {
			isOpponentPresent = true;
			// If Host, broadcast game_init so Guest gets the board config and starts
			if (selfRole === 1 && client && currentRoom) {
				const initMsg: WireMessage = {
					type: 'game_init',
					config: gameStore.state.config,
					player1Id: client.selfLabel,
					player2Id: wireMsg.sender
				};
				client
					.publish({
						room: currentRoom,
						channel: 'game',
						payload: JSON.stringify(initMsg),
						reliable: true
					})
					.catch(() => {});
			}
		} else if (wireMsg.type === 'game_init' || wireMsg.type === 'config_change') {
			isOpponentPresent = true;
			if (selfRole === 2) {
				gameStore.setOnlineRole(2);
				gameStore.startNewGame(wireMsg.config, 'online', true);
			}
		} else if (wireMsg.type === 'move') {
			if (wireMsg.player !== selfRole) {
				gameStore.applyRemoteMove(wireMsg.action);
			}
		} else if (wireMsg.type === 'restart_request') {
			gameStore.resetCurrentGame();
		}
	}

	async function ensureConnected(targetUrl?: string, targetKey?: string): Promise<Client> {
		const url = targetUrl || serverUrl;
		const key = targetKey || apiKey;

		if (!key.trim()) {
			const errMsg = 'API key is required to connect to the online server';
			error = errMsg;
			throw new Error(errMsg);
		}

		if (client && isConnected && lastConnectedUrl === url && lastConnectedKey === key) {
			return client;
		}

		// If reconnecting with different URL or API key, close existing connection
		if (client) {
			try {
				await client.close();
			} catch {
				// ignore
			}
			client = null;
		}

		isConnecting = true;
		error = null;

		try {
			const newClient = new Client({
				url,
				apiKey: key.trim(),
				heartbeat: { intervalMs: 25000, timeoutMs: 10000 },
				reconnect: { baseDelayMs: 500, maxDelayMs: 10000 },
				authFailureMode: 'never-fatal'
			});

			newClient.on('connected', () => {
				isConnected = true;
				isConnecting = false;
				error = null;
			});

			newClient.on('disconnected', () => {
				isConnected = false;
			});

			newClient.on('message', (frame) => {
				handleInboundMessage(frame);
			});

			newClient.on('presenceJoin', (ev) => {
				if (ev.room === currentRoom && ev.who !== newClient?.selfLabel) {
					isOpponentPresent = true;
					// If Host, broadcast game_init so Guest receives board setup
					if (selfRole === 1 && currentRoom) {
						const initMsg: WireMessage = {
							type: 'game_init',
							config: gameStore.state.config,
							player1Id: newClient.selfLabel,
							player2Id: ev.who
						};
						newClient
							.publish({
								room: currentRoom,
								channel: 'game',
								payload: JSON.stringify(initMsg),
								reliable: true
							})
							.catch(() => {});
					}
				}
			});

			newClient.on('presenceLeave', (ev) => {
				if (ev.room === currentRoom && ev.who !== newClient?.selfLabel) {
					isOpponentPresent = false;
				}
			});

			newClient.on('error', (err) => {
				error = err.error?.message || 'Connection error';
			});

			await newClient.connect();
			client = newClient;
			lastConnectedUrl = url;
			lastConnectedKey = key;
			isConnected = true;
			isConnecting = false;
			return newClient;
		} catch (err: unknown) {
			isConnecting = false;
			isConnected = false;
			error = err instanceof Error ? err.message : 'Failed to connect to server';
			throw err;
		}
	}

	// Register move transmitter on gameStore
	gameStore.setOnMove((action, player) => {
		if (client && currentRoom && selfRole === player) {
			const msg: WireMessage = {
				type: 'move',
				action,
				player,
				seq: Date.now()
			};
			client
				.publish({
					room: currentRoom,
					channel: 'game',
					payload: JSON.stringify(msg),
					reliable: true
				})
				.catch(() => {});
		}
	});

	// Register config change transmitter on gameStore (host broadcasts setup changes)
	gameStore.setOnConfigChange((config) => {
		if (client && currentRoom && selfRole === 1) {
			const msg: WireMessage = {
				type: 'config_change',
				config
			};
			client
				.publish({
					room: currentRoom,
					channel: 'game',
					payload: JSON.stringify(msg),
					reliable: true
				})
				.catch(() => {});
		}
	});

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
		get apiKey() {
			return apiKey;
		},

		setServerUrl(url: string) {
			serverUrl = url;
		},

		setApiKey(key: string) {
			apiKey = key;
		},

		async createRoom(config: BoardConfig, key?: string): Promise<string> {
			if (key) apiKey = key;
			const cli = await ensureConnected(serverUrl, apiKey);
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

			gameStore.setOnlineRole(1);
			gameStore.startNewGame(config, 'online');
			return code;
		},

		async joinRoom(code: string, key?: string): Promise<void> {
			if (key) apiKey = key;
			const cli = await ensureConnected(serverUrl, apiKey);
			await cli.joinRoom({ room: code });

			currentRoom = code;
			selfRole = 2;
			isOpponentPresent = true;

			gameStore.setOnlineRole(2);
			gameStore.setGameMode('online');

			// Send guest_ready to host
			const readyMsg: WireMessage = {
				type: 'guest_ready',
				sender: cli.selfLabel
			};
			await cli.publish({
				room: code,
				channel: 'game',
				payload: JSON.stringify(readyMsg),
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
			gameStore.setOnlineRole(null);
			gameStore.setGameMode('ai');
		}
	};
}

export const onlineStore = createOnlineStore();
