import type { BoardConfig, GameState, MoveAction, Piece, PlayerId } from '#lib/types/game.js';
import { selectBotMove, type AiDifficulty } from '#lib/utils/aiBot.js';
import {
	applyMove,
	canPlacePiece,
	createInitialState,
	getLegalMoves,
	getTopPiece
} from '#lib/utils/gameRules.js';
import { createConfigFromPreset, PRESETS } from '#lib/utils/presets.js';
import { sounds } from '#lib/utils/sound.js';

export type GameMode = 'pass-and-play' | 'ai' | 'online';

export interface SelectedPieceState {
	source: 'reserve' | 'board';
	piece: Piece;
	fromRow?: number;
	fromCol?: number;
}

export function createGameStore() {
	const defaultConfig = createConfigFromPreset(PRESETS[0]);
	const initialGameState = createInitialState(defaultConfig);
	let state = $state<GameState>(initialGameState);
	let history = $state<GameState[]>([initialGameState]);
	let historyIndex = $state<number>(0);

	let selected = $state<SelectedPieceState | null>(null);
	let gameMode = $state<GameMode>('ai');
	let aiDifficulty = $state<AiDifficulty>('medium');
	let aiPlayer = $state<PlayerId>(2);
	let isAiThinking = $state<boolean>(false);
	let onlineRole = $state<PlayerId | null>(null);
	let onMoveCallback: ((action: MoveAction, player: PlayerId) => void) | null = null;

	let inspectedStack = $state<{ row: number; col: number; stack: Piece[] } | null>(null);

	const legalMoves = $derived(getLegalMoves(state));

	// Candidate drop squares for currently selected piece
	const validTargetSquares = $derived.by(() => {
		const currentSelected = selected;
		if (!currentSelected) return [];
		const targets: [number, number][] = [];
		const size = state.config.size;
		const stackCap = state.config.variants.stackCap;

		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				if (
					currentSelected.source === 'board' &&
					currentSelected.fromRow === r &&
					currentSelected.fromCol === c
				) {
					continue;
				}
				if (canPlacePiece(state.board[r][c], currentSelected.piece, stackCap)) {
					// Also verify if noRevealWin variant allows this move
					if (currentSelected.source === 'board' && state.config.variants.noRevealWin) {
						const isLegal = legalMoves.some(
							(m) =>
								m.type === 'move' &&
								m.fromRow === currentSelected.fromRow &&
								m.fromCol === currentSelected.fromCol &&
								m.toRow === r &&
								m.toCol === c
						);
						if (!isLegal) continue;
					}
					targets.push([r, c]);
				}
			}
		}
		return targets;
	});

	function playMoveAudio(action: MoveAction, prevBoardState: Piece[][][]): void {
		const targetSquare = prevBoardState[action.toRow][action.toCol];
		const hasCovered = targetSquare.length > 0;

		let hasRevealed = false;
		if (action.type === 'move') {
			const sourceSquare = prevBoardState[action.fromRow][action.fromCol];
			hasRevealed = sourceSquare.length > 1;
		}

		if (hasCovered) {
			sounds.playGobble();
		} else if (hasRevealed) {
			sounds.playReveal();
		} else {
			sounds.playPlace();
		}
	}

	async function checkAndTriggerAi(): Promise<void> {
		if (gameMode !== 'ai' || state.status.state !== 'playing' || state.activePlayer !== aiPlayer) {
			return;
		}

		isAiThinking = true;

		// Realistic slight pause for thoughtful bot feel
		await new Promise((resolve) => setTimeout(resolve, 380));

		if (state.status.state !== 'playing' || state.activePlayer !== aiPlayer) {
			isAiThinking = false;
			return;
		}

		const botMove = selectBotMove(state, aiDifficulty);
		isAiThinking = false;

		if (botMove) {
			executeMove(botMove);
		}
	}

	function executeMove(action: MoveAction, isRemote = false): boolean {
		const prevBoard = state.board;
		const playerWhoMoved = state.activePlayer;
		const result = applyMove(state, action);
		if (result.error) {
			sounds.playInvalid();
			return false;
		}

		playMoveAudio(action, prevBoard);

		state = result.nextState;

		// Truncate future history if branching after undo
		history = [...history.slice(0, historyIndex + 1), state];
		historyIndex = history.length - 1;

		selected = null;

		// Broadcast move over WebSocket in online mode
		if (!isRemote && gameMode === 'online' && onMoveCallback) {
			onMoveCallback(action, playerWhoMoved);
		}

		if (state.status.state === 'won') {
			sounds.playWin();
		} else if (state.status.state === 'playing') {
			// Trigger AI if applicable
			setTimeout(() => {
				checkAndTriggerAi().catch(() => {});
			}, 50);
		}

		return true;
	}

	return {
		get state() {
			return state;
		},
		get legalMoves() {
			return legalMoves;
		},
		get selected() {
			return selected;
		},
		get validTargetSquares() {
			return validTargetSquares;
		},
		get gameMode() {
			return gameMode;
		},
		get aiDifficulty() {
			return aiDifficulty;
		},
		get aiPlayer() {
			return aiPlayer;
		},
		get isAiThinking() {
			return isAiThinking;
		},
		get onlineRole() {
			return onlineRole;
		},
		get inspectedStack() {
			return inspectedStack;
		},
		get canUndo() {
			return historyIndex > 0 && gameMode !== 'online';
		},
		get canRedo() {
			return historyIndex < history.length - 1 && gameMode !== 'online';
		},

		setGameMode(mode: GameMode) {
			gameMode = mode;
			selected = null;
		},

		setOnlineRole(role: PlayerId | null) {
			onlineRole = role;
		},

		setOnMove(cb: (action: MoveAction, player: PlayerId) => void) {
			onMoveCallback = cb;
		},

		setAiDifficulty(diff: AiDifficulty) {
			aiDifficulty = diff;
		},

		setAiPlayer(player: PlayerId) {
			aiPlayer = player;
			if (state.activePlayer === aiPlayer && gameMode === 'ai') {
				checkAndTriggerAi().catch(() => {});
			}
		},

		selectReservePiece(piece: Piece) {
			if (state.status.state !== 'playing' || isAiThinking) return;
			if (gameMode === 'ai' && state.activePlayer === aiPlayer) return;
			if (gameMode === 'online' && onlineRole !== null && state.activePlayer !== onlineRole) return;
			if (piece.owner !== state.activePlayer) {
				sounds.playInvalid();
				return;
			}

			if (selected?.piece.id === piece.id) {
				selected = null;
			} else {
				selected = {
					source: 'reserve',
					piece
				};
				sounds.playPickup();
			}
		},

		handleSquareClick(row: number, col: number) {
			if (state.status.state !== 'playing' || isAiThinking) return;
			if (gameMode === 'ai' && state.activePlayer === aiPlayer) return;
			if (gameMode === 'online' && onlineRole !== null && state.activePlayer !== onlineRole) return;

			const square = state.board[row][col];
			const top = getTopPiece(square);

			// If a piece is already selected, try to move/place it here
			if (selected) {
				// If clicking same piece on board, deselect
				if (selected.source === 'board' && selected.fromRow === row && selected.fromCol === col) {
					selected = null;
					return;
				}

				// Check if this square is a valid target
				const isValid = validTargetSquares.some(([r, c]) => r === row && c === col);
				if (isValid) {
					if (selected.source === 'reserve') {
						executeMove({
							type: 'place',
							pieceId: selected.piece.id,
							toRow: row,
							toCol: col
						});
					} else {
						executeMove({
							type: 'move',
							fromRow: selected.fromRow!,
							fromCol: selected.fromCol!,
							toRow: row,
							toCol: col
						});
					}
					return;
				}
			}

			// If no piece is selected, or invalid square clicked:
			// Check if clicking own top piece on board to select it for moving
			if (top && top.owner === state.activePlayer && !state.config.variants.noMoving) {
				selected = {
					source: 'board',
					piece: top,
					fromRow: row,
					fromCol: col
				};
				sounds.playPickup();
			} else if (selected) {
				sounds.playInvalid();
				selected = null;
			}
		},

		inspectSquare(row: number, col: number) {
			const stack = state.board[row][col];
			inspectedStack = { row, col, stack: [...stack] };
		},

		closeInspect() {
			inspectedStack = null;
		},

		undo() {
			if (historyIndex <= 0 || gameMode === 'online') return;
			// In AI mode, undo 2 moves so it's back to player's turn
			const step = gameMode === 'ai' && historyIndex >= 2 ? 2 : 1;
			historyIndex = Math.max(0, historyIndex - step);
			state = history[historyIndex];
			selected = null;
		},

		redo() {
			if (historyIndex >= history.length - 1 || gameMode === 'online') return;
			const step = gameMode === 'ai' && historyIndex + 2 <= history.length - 1 ? 2 : 1;
			historyIndex = Math.min(history.length - 1, historyIndex + step);
			state = history[historyIndex];
			selected = null;
		},

		resetCurrentGame() {
			state = createInitialState(state.config);
			history = [state];
			historyIndex = 0;
			selected = null;
			if (gameMode === 'ai' && state.activePlayer === aiPlayer) {
				checkAndTriggerAi().catch(() => {});
			}
		},

		startNewGame(config: BoardConfig, mode?: GameMode) {
			if (mode) gameMode = mode;
			state = createInitialState(config);
			history = [state];
			historyIndex = 0;
			selected = null;
			if (gameMode === 'ai' && state.activePlayer === aiPlayer) {
				checkAndTriggerAi().catch(() => {});
			}
		},

		applyRemoteMove(action: MoveAction) {
			return executeMove(action, true);
		}
	};
}

export const gameStore = createGameStore();
