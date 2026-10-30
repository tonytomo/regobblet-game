import type {
	BoardConfig,
	BoardSquare,
	GameState,
	MoveAction,
	MoveRecord,
	Piece,
	PlayerId,
	WinningLine
} from '#lib/types/game.js';

export function createInitialState(config: BoardConfig): GameState {
	const board: BoardSquare[][] = Array.from({ length: config.size }, () =>
		Array.from({ length: config.size }, () => [])
	);

	const createReserves = (owner: PlayerId): Piece[] => {
		const pieces: Piece[] = [];
		let index = 1;
		for (const dist of config.distribution) {
			for (let i = 0; i < dist.count; i++) {
				pieces.push({
					id: `p${owner}-r${dist.rank}-${index++}`,
					owner,
					rank: dist.rank
				});
			}
		}
		// Sort by rank ascending
		return pieces.sort((a, b) => a.rank - b.rank);
	};

	const state: GameState = {
		board,
		reserves: {
			1: createReserves(1),
			2: createReserves(2)
		},
		activePlayer: 1,
		moveCount: 0,
		totalTurns: 0,
		config,
		status: { state: 'playing' },
		history: [],
		positionHistory: new Map<string, number>()
	};

	const initialKey = generateStateKey(state);
	state.positionHistory.set(initialKey, 1);

	return state;
}

export function getTopPiece(square: BoardSquare): Piece | null {
	if (!square || square.length === 0) return null;
	return square[square.length - 1];
}

export function canPlacePiece(square: BoardSquare, piece: Piece, stackCap?: number): boolean {
	if (stackCap !== undefined && square.length >= stackCap) {
		return false;
	}
	const top = getTopPiece(square);
	if (!top) return true;
	return piece.rank > top.rank;
}

export function getAllWinningLines(size: number, winLength: number): [number, number][][] {
	const lines: [number, number][][] = [];

	// Rows
	for (let r = 0; r < size; r++) {
		for (let c = 0; c <= size - winLength; c++) {
			const line: [number, number][] = [];
			for (let k = 0; k < winLength; k++) {
				line.push([r, c + k]);
			}
			lines.push(line);
		}
	}

	// Columns
	for (let c = 0; c < size; c++) {
		for (let r = 0; r <= size - winLength; r++) {
			const line: [number, number][] = [];
			for (let k = 0; k < winLength; k++) {
				line.push([r + k, c]);
			}
			lines.push(line);
		}
	}

	// Main diagonals (\)
	for (let r = 0; r <= size - winLength; r++) {
		for (let c = 0; c <= size - winLength; c++) {
			const line: [number, number][] = [];
			for (let k = 0; k < winLength; k++) {
				line.push([r + k, c + k]);
			}
			lines.push(line);
		}
	}

	// Anti-diagonals (/)
	for (let r = 0; r <= size - winLength; r++) {
		for (let c = winLength - 1; c < size; c++) {
			const line: [number, number][] = [];
			for (let k = 0; k < winLength; k++) {
				line.push([r + k, c - k]);
			}
			lines.push(line);
		}
	}

	return lines;
}

export function checkWinLines(board: BoardSquare[][], winLength: number): WinningLine[] {
	const size = board.length;
	const candidateLines = getAllWinningLines(size, winLength);
	const results: WinningLine[] = [];

	for (const cells of candidateLines) {
		const firstPiece = getTopPiece(board[cells[0][0]][cells[0][1]]);
		if (!firstPiece) continue;
		const owner = firstPiece.owner;

		let isAllSame = true;
		for (let i = 1; i < cells.length; i++) {
			const piece = getTopPiece(board[cells[i][0]][cells[i][1]]);
			if (!piece || piece.owner !== owner) {
				isAllSame = false;
				break;
			}
		}

		if (isAllSame) {
			const [r0, c0] = cells[0];
			const [r1, c1] = cells[1];
			const direction: WinningLine['direction'] =
				r0 === r1 ? 'row' : c0 === c1 ? 'col' : c1 > c0 ? 'diag-main' : 'diag-anti';

			results.push({ cells, owner, direction });
		}
	}

	return results;
}

export function getLegalMoves(state: GameState): MoveAction[] {
	if (state.status.state !== 'playing') {
		return [];
	}

	const moves: MoveAction[] = [];
	const size = state.config.size;
	const active = state.activePlayer;
	const reserve = state.reserves[active];
	const stackCap = state.config.variants.stackCap;

	// 1. Placement from reserve
	// Group reserve pieces by unique rank so we don't generate duplicate move actions for identical duplicate ranks
	const seenRanks = new Set<number>();
	for (const piece of reserve) {
		if (seenRanks.has(piece.rank)) continue;
		seenRanks.add(piece.rank);

		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				if (canPlacePiece(state.board[r][c], piece, stackCap)) {
					moves.push({
						type: 'place',
						pieceId: piece.id,
						toRow: r,
						toCol: c
					});
				}
			}
		}
	}

	// 2. Movement of top pieces on board
	if (!state.config.variants.noMoving) {
		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				const top = getTopPiece(state.board[r][c]);
				if (!top || top.owner !== active) continue;

				for (let tr = 0; tr < size; tr++) {
					for (let tc = 0; tc < size; tc++) {
						if (r === tr && c === tc) continue; // Must change squares
						if (canPlacePiece(state.board[tr][tc], top, stackCap)) {
							const candidateMove: MoveAction = {
								type: 'move',
								fromRow: r,
								fromCol: c,
								toRow: tr,
								toCol: tc
							};

							// If noRevealWin variant is active, filter out moves revealing opponent win
							if (state.config.variants.noRevealWin) {
								if (isRevealWinForOpponent(state, candidateMove)) {
									continue;
								}
							}

							moves.push(candidateMove);
						}
					}
				}
			}
		}
	}

	return moves;
}

function isRevealWinForOpponent(state: GameState, move: MoveAction): boolean {
	if (move.type !== 'move') return false;

	const opponent: PlayerId = state.activePlayer === 1 ? 2 : 1;
	// Simulate picking up the piece from fromRow, fromCol
	const simulatedBoard = state.board.map((row) => row.map((cell) => [...cell]));
	simulatedBoard[move.fromRow][move.fromCol].pop();

	// Check if this uncovers a winning line for opponent
	const lines = checkWinLines(simulatedBoard, state.config.winLength);
	return lines.some((l) => l.owner === opponent);
}

export function generateStateKey(state: GameState): string {
	const boardParts: string[] = [];
	for (let r = 0; r < state.config.size; r++) {
		for (let c = 0; c < state.config.size; c++) {
			const stack = state.board[r][c];
			if (stack.length === 0) {
				boardParts.push('.');
			} else {
				boardParts.push(stack.map((p) => `${p.owner}r${p.rank}`).join(':'));
			}
		}
	}

	const p1Res = state.reserves[1]
		.map((p) => p.rank)
		.sort((a, b) => a - b)
		.join(',');
	const p2Res = state.reserves[2]
		.map((p) => p.rank)
		.sort((a, b) => a - b)
		.join(',');

	return `${boardParts.join('/')}|P1:${p1Res}|P2:${p2Res}|T:${state.activePlayer}`;
}

export function coordinateToNotation(row: number, col: number): string {
	const colLetter = String.fromCharCode(65 + col); // 0 -> 'A'
	const rowNumber = row + 1; // 0 -> '1'
	return `${colLetter}${rowNumber}`;
}

export function applyMove(
	state: GameState,
	action: MoveAction
): { nextState: GameState; record: MoveRecord; error?: string } {
	if (state.status.state !== 'playing') {
		return { nextState: state, record: {} as MoveRecord, error: 'Game is not in playing state' };
	}

	const active = state.activePlayer;
	const opponent: PlayerId = active === 1 ? 2 : 1;

	// Deep clone board and reserves
	const nextBoard: BoardSquare[][] = state.board.map((row) => row.map((cell) => [...cell]));
	const nextReserves = {
		1: [...state.reserves[1]],
		2: [...state.reserves[2]]
	};

	let movedPiece: Piece;
	let coveredPiece: Piece | undefined;
	let uncoveredPiece: Piece | undefined;
	let notation: string;

	if (action.type === 'place') {
		const pieceIndex = nextReserves[active].findIndex((p) => p.id === action.pieceId);
		if (pieceIndex === -1) {
			return { nextState: state, record: {} as MoveRecord, error: 'Piece not found in reserve' };
		}
		movedPiece = nextReserves[active][pieceIndex];
		const destSquare = nextBoard[action.toRow][action.toCol];

		if (!canPlacePiece(destSquare, movedPiece, state.config.variants.stackCap)) {
			return { nextState: state, record: {} as MoveRecord, error: 'Illegal placement on square' };
		}

		coveredPiece = getTopPiece(destSquare) ?? undefined;
		nextReserves[active].splice(pieceIndex, 1);
		destSquare.push(movedPiece);

		const toCoord = coordinateToNotation(action.toRow, action.toCol);
		notation = `P${active}: R${movedPiece.rank}@${toCoord}`;
		if (coveredPiece) {
			notation += ` (covers P${coveredPiece.owner}:R${coveredPiece.rank})`;
		}
	} else {
		// action.type === 'move'
		if (state.config.variants.noMoving) {
			return {
				nextState: state,
				record: {} as MoveRecord,
				error: 'Moving pieces is disabled in this variant'
			};
		}
		if (action.fromRow === action.toRow && action.fromCol === action.toCol) {
			return {
				nextState: state,
				record: {} as MoveRecord,
				error: 'Move destination must differ from source'
			};
		}

		const sourceSquare = nextBoard[action.fromRow][action.fromCol];
		const destSquare = nextBoard[action.toRow][action.toCol];

		const top = getTopPiece(sourceSquare);
		if (!top || top.owner !== active) {
			return {
				nextState: state,
				record: {} as MoveRecord,
				error: 'No active player top piece at source square'
			};
		}

		if (!canPlacePiece(destSquare, top, state.config.variants.stackCap)) {
			return {
				nextState: state,
				record: {} as MoveRecord,
				error: 'Cannot move to destination square'
			};
		}

		movedPiece = sourceSquare.pop()!;
		uncoveredPiece = getTopPiece(sourceSquare) ?? undefined;
		coveredPiece = getTopPiece(destSquare) ?? undefined;
		destSquare.push(movedPiece);

		const fromCoord = coordinateToNotation(action.fromRow, action.fromCol);
		const toCoord = coordinateToNotation(action.toRow, action.toCol);
		notation = `P${active}: R${movedPiece.rank} ${fromCoord}→${toCoord}`;
		if (uncoveredPiece) {
			notation += ` (reveals P${uncoveredPiece.owner}:R${uncoveredPiece.rank})`;
		}
		if (coveredPiece) {
			notation += ` (covers P${coveredPiece.owner}:R${coveredPiece.rank})`;
		}
	}

	const record: MoveRecord = {
		action,
		player: active,
		piece: movedPiece,
		coveredPiece,
		uncoveredPiece,
		notation,
		turnNumber: state.totalTurns + 1
	};

	// Winning check
	// According to rules:
	// "Uncovering an opponent's win is legal but loses. If your move reveals a line of your opponent's pieces, your opponent wins immediately."
	const winningLines = checkWinLines(nextBoard, state.config.winLength);
	const opponentWinLines = winningLines.filter((l) => l.owner === opponent);
	const activeWinLines = winningLines.filter((l) => l.owner === active);

	let nextStatus: GameState['status'] = { state: 'playing' };

	if (opponentWinLines.length > 0) {
		nextStatus = {
			state: 'won',
			winner: opponent,
			line: opponentWinLines[0],
			reason: 'reveal_line'
		};
	} else if (activeWinLines.length > 0) {
		nextStatus = {
			state: 'won',
			winner: active,
			line: activeWinLines[0],
			reason: 'line'
		};
	}

	const nextMoveCount = state.moveCount + 1;
	const nextTotalTurns = state.totalTurns + 1;
	const nextActivePlayer: PlayerId = opponent;

	const nextPositionHistory = new Map(state.positionHistory);

	const tentativeNextState: GameState = {
		board: nextBoard,
		reserves: nextReserves,
		activePlayer: nextActivePlayer,
		moveCount: nextMoveCount,
		totalTurns: nextTotalTurns,
		config: state.config,
		status: nextStatus,
		history: [...state.history, record],
		positionHistory: nextPositionHistory,
		lastMove: action
	};

	// Check draw conditions if still playing
	if (tentativeNextState.status.state === 'playing') {
		// 1. Move limit
		if (nextMoveCount >= state.config.moveLimit) {
			tentativeNextState.status = {
				state: 'draw',
				reason: 'move_limit'
			};
		} else {
			// 2. Threefold repetition
			const stateKey = generateStateKey(tentativeNextState);
			const currentCount = (nextPositionHistory.get(stateKey) ?? 0) + 1;
			nextPositionHistory.set(stateKey, currentCount);

			if (currentCount >= 3) {
				tentativeNextState.status = {
					state: 'draw',
					reason: 'threefold_repetition'
				};
			} else {
				// 3. Stalemate: next player has no legal moves
				const nextLegalMoves = getLegalMoves(tentativeNextState);
				if (nextLegalMoves.length === 0) {
					tentativeNextState.status = {
						state: 'draw',
						reason: 'stalemate'
					};
				}
			}
		}
	}

	return { nextState: tentativeNextState, record };
}
