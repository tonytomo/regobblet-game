import type { GameState, MoveAction, PlayerId } from '#lib/types/game.js';
import { applyMove, getLegalMoves, getTopPiece } from './gameRules.js';

export type AiDifficulty = 'easy' | 'medium' | 'hard';

export function selectBotMove(state: GameState, difficulty: AiDifficulty): MoveAction | null {
	const legalMoves = getLegalMoves(state);
	if (legalMoves.length === 0) return null;

	if (difficulty === 'easy') {
		return selectEasyMove(state, legalMoves);
	} else if (difficulty === 'medium') {
		return selectMediumMove(state, legalMoves);
	} else {
		return selectHardMove(state, legalMoves);
	}
}

function selectEasyMove(state: GameState, moves: MoveAction[]): MoveAction {
	const bot = state.activePlayer;

	// Check if any move immediately wins
	for (const move of moves) {
		const { nextState } = applyMove(state, move);
		if (nextState.status.state === 'won' && nextState.status.winner === bot) {
			return move;
		}
	}

	// Otherwise, pick random move
	return moves[Math.floor(Math.random() * moves.length)];
}

function selectMediumMove(state: GameState, moves: MoveAction[]): MoveAction {
	const bot = state.activePlayer;
	const opponent: PlayerId = bot === 1 ? 2 : 1;

	// 1. Immediate win check
	for (const move of moves) {
		const { nextState } = applyMove(state, move);
		if (nextState.status.state === 'won' && nextState.status.winner === bot) {
			return move;
		}
	}

	// 2. Immediate loss prevention (check if opponent has a 1-move win)
	// Create hypothetical state where opponent moves now to find opponent threats
	const hypotheticalOpponentState: GameState = {
		...state,
		activePlayer: opponent
	};
	const opponentMoves = getLegalMoves(hypotheticalOpponentState);
	const immediateThreatSquares = new Set<string>();

	for (const oppMove of opponentMoves) {
		const { nextState } = applyMove(hypotheticalOpponentState, oppMove);
		if (nextState.status.state === 'won' && nextState.status.winner === opponent) {
			const toR = oppMove.toRow;
			const toC = oppMove.toCol;
			immediateThreatSquares.add(`${toR},${toC}`);
		}
	}

	// If there are immediate threat squares, try to occupy/cover them
	if (immediateThreatSquares.size > 0) {
		const blockingMoves = moves.filter((m) => immediateThreatSquares.has(`${m.toRow},${m.toCol}`));
		if (blockingMoves.length > 0) {
			// Pick blocking move with lowest adequate rank to conserve higher pieces
			return blockingMoves[0];
		}
	}

	// 3. Score all moves with a heuristic
	let bestScore = -Infinity;
	let bestMoves: MoveAction[] = [];

	for (const move of moves) {
		const { nextState } = applyMove(state, move);

		// If this move causes a loss (e.g. reveals opponent win or immediately allows opponent to win)
		if (nextState.status.state === 'won' && nextState.status.winner === opponent) {
			continue;
		}

		let score = 0;
		const center = (state.config.size - 1) / 2;
		const distToCenter = Math.abs(move.toRow - center) + Math.abs(move.toCol - center);
		score -= distToCenter * 2; // closer to center is better

		// Prefer gobbling opponent pieces
		const targetSquare = state.board[move.toRow][move.toCol];
		const targetTop = getTopPiece(targetSquare);
		if (targetTop && targetTop.owner === opponent) {
			score += 15 + targetTop.rank * 2;
		}

		// Don't hoard lowest ranks too late, but don't waste highest rank on empty squares early
		if (move.type === 'place') {
			const piece = state.reserves[bot].find((p) => p.id === move.pieceId);
			if (piece) {
				if (piece.rank > 6 && !targetTop) {
					score -= 10; // penalty for dropping high rank on empty square
				}
			}
		}

		if (score > bestScore) {
			bestScore = score;
			bestMoves = [move];
		} else if (score === bestScore) {
			bestMoves.push(move);
		}
	}

	if (bestMoves.length > 0) {
		return bestMoves[Math.floor(Math.random() * bestMoves.length)];
	}

	return moves[Math.floor(Math.random() * moves.length)];
}

function selectHardMove(state: GameState, moves: MoveAction[]): MoveAction {
	const bot = state.activePlayer;
	const depth = state.config.size === 3 ? 3 : state.config.size === 4 ? 2 : 2;

	let bestMove: MoveAction = moves[0];
	let maxEval = -Infinity;

	// Sort moves: gobbles and center moves first for better alpha-beta cutoffs
	const sortedMoves = [...moves].sort((a, b) => {
		const targetA = getTopPiece(state.board[a.toRow][a.toCol]);
		const targetB = getTopPiece(state.board[b.toRow][b.toCol]);
		const rankA = targetA ? targetA.rank : 0;
		const rankB = targetB ? targetB.rank : 0;
		return rankB - rankA;
	});

	for (const move of sortedMoves) {
		const { nextState } = applyMove(state, move);
		const evalScore = minimax(nextState, depth - 1, -Infinity, Infinity, false, bot);

		if (evalScore > maxEval) {
			maxEval = evalScore;
			bestMove = move;
		}
	}

	return bestMove;
}

function evaluateBoard(state: GameState, bot: PlayerId): number {
	const opponent: PlayerId = bot === 1 ? 2 : 1;

	if (state.status.state === 'won') {
		return state.status.winner === bot ? 10000 : -10000;
	}
	if (state.status.state === 'draw') {
		return 0;
	}

	const size = state.config.size;
	let score = 0;
	const center = (size - 1) / 2;

	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			const top = getTopPiece(state.board[r][c]);
			if (!top) continue;

			const distFromCenter = Math.abs(r - center) + Math.abs(c - center);
			const centerWeight = Math.max(0, 4 - distFromCenter);

			if (top.owner === bot) {
				score += 5 + top.rank + centerWeight * 2;
			} else {
				score -= 5 + top.rank + centerWeight * 2;
			}
		}
	}

	// Reserve advantage
	const botReserveSum = state.reserves[bot].reduce((acc, p) => acc + p.rank, 0);
	const oppReserveSum = state.reserves[opponent].reduce((acc, p) => acc + p.rank, 0);
	score += (botReserveSum - oppReserveSum) * 0.5;

	return score;
}

function minimax(
	state: GameState,
	depth: number,
	alpha: number,
	beta: number,
	isMaximizing: boolean,
	bot: PlayerId
): number {
	if (depth === 0 || state.status.state !== 'playing') {
		return evaluateBoard(state, bot);
	}

	const moves = getLegalMoves(state);
	if (moves.length === 0) {
		return evaluateBoard(state, bot);
	}

	if (isMaximizing) {
		let maxVal = -Infinity;
		for (const move of moves) {
			const { nextState } = applyMove(state, move);
			const val = minimax(nextState, depth - 1, alpha, beta, false, bot);
			maxVal = Math.max(maxVal, val);
			alpha = Math.max(alpha, val);
			if (beta <= alpha) break;
		}
		return maxVal;
	} else {
		let minVal = Infinity;
		for (const move of moves) {
			const { nextState } = applyMove(state, move);
			const val = minimax(nextState, depth - 1, alpha, beta, true, bot);
			minVal = Math.min(minVal, val);
			beta = Math.min(beta, val);
			if (beta <= alpha) break;
		}
		return minVal;
	}
}
