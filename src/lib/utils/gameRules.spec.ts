import { describe, it, expect } from 'vitest';
import {
	createInitialState,
	canPlacePiece,
	getAllWinningLines,
	getLegalMoves,
	applyMove
} from './gameRules.js';
import { createConfigFromPreset, getPresetById } from './presets.js';
import type { MoveAction, Piece } from '#lib/types/game.js';

describe('Regobblet Presets & Winning Lines', () => {
	it('matches official winning line counts for all board configurations', () => {
		// 3x3 with winLength 3 => 8 lines (3 rows, 3 cols, 2 diags)
		const lines3x3 = getAllWinningLines(3, 3);
		expect(lines3x3.length).toBe(8);

		// 4x4 with winLength 4 => 10 lines
		const lines4x4Len4 = getAllWinningLines(4, 4);
		expect(lines4x4Len4.length).toBe(10);

		// 4x4 with winLength 3 => 24 lines (official recommended fast mode)
		const lines4x4Len3 = getAllWinningLines(4, 3);
		expect(lines4x4Len3.length).toBe(24);

		// 5x5 with winLength 4 => 28 lines (official default)
		const lines5x5Len4 = getAllWinningLines(5, 4);
		expect(lines5x5Len4.length).toBe(28);

		// 5x5 with winLength 5 => 12 lines (positional mode)
		const lines5x5Len5 = getAllWinningLines(5, 5);
		expect(lines5x5Len5.length).toBe(12);
	});

	it('initializes 3x3 default board with 6 pieces each (ranks 1-6)', () => {
		const preset = getPresetById('3x3-default');
		const config = createConfigFromPreset(preset);
		const state = createInitialState(config);

		expect(state.config.size).toBe(3);
		expect(state.config.winLength).toBe(3);
		expect(state.reserves[1].length).toBe(6);
		expect(state.reserves[2].length).toBe(6);
		expect(state.reserves[1].map((p) => p.rank)).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it('initializes 5x5 balanced preset with 16 pieces (2x ranks 1-4, 1x ranks 5-12)', () => {
		const preset = getPresetById('5x5-balanced');
		const config = createConfigFromPreset(preset);
		const state = createInitialState(config);

		expect(state.config.size).toBe(5);
		expect(state.config.winLength).toBe(4);
		expect(state.reserves[1].length).toBe(16);
		expect(state.reserves[2].length).toBe(16);
	});
});

describe('Placing and Gobbling Mechanics', () => {
	it('allows placing on empty square', () => {
		const emptySquare: Piece[] = [];
		const piece = { id: 'p1', owner: 1 as const, rank: 2 };
		expect(canPlacePiece(emptySquare, piece)).toBe(true);
	});

	it('allows gobbling strictly smaller pieces (both opponent and self)', () => {
		const squareWithOpponentRank2 = [{ id: 'p2', owner: 2 as const, rank: 2 }];
		const squareWithSelfRank2 = [{ id: 'p1-sub', owner: 1 as const, rank: 2 }];

		const largerPiece = { id: 'p1', owner: 1 as const, rank: 4 };
		expect(canPlacePiece(squareWithOpponentRank2, largerPiece)).toBe(true);
		expect(canPlacePiece(squareWithSelfRank2, largerPiece)).toBe(true);
	});

	it('forbids placing equal or smaller pieces on top of larger ones', () => {
		const squareWithRank4 = [{ id: 'p2', owner: 2 as const, rank: 4 }];

		const equalPiece = { id: 'p1-eq', owner: 1 as const, rank: 4 };
		const smallerPiece = { id: 'p1-sm', owner: 1 as const, rank: 3 };

		expect(canPlacePiece(squareWithRank4, equalPiece)).toBe(false);
		expect(canPlacePiece(squareWithRank4, smallerPiece)).toBe(false);
	});

	it('enforces stack cap when variant is enabled', () => {
		const square = [
			{ id: '1', owner: 1 as const, rank: 1 },
			{ id: '2', owner: 2 as const, rank: 2 },
			{ id: '3', owner: 1 as const, rank: 3 }
		];
		const piece = { id: '4', owner: 2 as const, rank: 5 };

		// With cap = 3, square has 3 pieces, so placing should be disallowed
		expect(canPlacePiece(square, piece, 3)).toBe(false);

		// With cap = 4, square has 3 pieces, so placing is allowed
		expect(canPlacePiece(square, piece, 4)).toBe(true);
	});
});

describe('Move Execution & Win Conditions', () => {
	it('detects a 3-in-a-row horizontal win', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'));
		let state = createInitialState(config);

		// P1 places R1 at (0, 0)
		const move1: MoveAction = {
			type: 'place',
			pieceId: state.reserves[1][0].id,
			toRow: 0,
			toCol: 0
		};
		state = applyMove(state, move1).nextState;

		// P2 places R1 at (1, 0)
		const move2: MoveAction = {
			type: 'place',
			pieceId: state.reserves[2][0].id,
			toRow: 1,
			toCol: 0
		};
		state = applyMove(state, move2).nextState;

		// P1 places R2 at (0, 1)
		const move3: MoveAction = {
			type: 'place',
			pieceId: state.reserves[1][0].id,
			toRow: 0,
			toCol: 1
		};
		state = applyMove(state, move3).nextState;

		// P2 places R2 at (1, 1)
		const move4: MoveAction = {
			type: 'place',
			pieceId: state.reserves[2][0].id,
			toRow: 1,
			toCol: 1
		};
		state = applyMove(state, move4).nextState;

		// P1 places R3 at (0, 2) -> Wins row 0!
		const move5: MoveAction = {
			type: 'place',
			pieceId: state.reserves[1][0].id,
			toRow: 0,
			toCol: 2
		};
		state = applyMove(state, move5).nextState;

		expect(state.status.state).toBe('won');
		if (state.status.state === 'won') {
			expect(state.status.winner).toBe(1);
			expect(state.status.reason).toBe('line');
		}
	});

	it('uncovering an opponent winning line causes immediate loss (reveal win)', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'));
		const state = createInitialState(config);

		// Set up board where P2 has (0,0), (0,1) and a buried (0,2) covered by P1's R5
		state.board[0][0] = [{ id: 'p2-1', owner: 2, rank: 2 }];
		state.board[0][1] = [{ id: 'p2-2', owner: 2, rank: 3 }];
		state.board[0][2] = [
			{ id: 'p2-3', owner: 2, rank: 1 },
			{ id: 'p1-top', owner: 1, rank: 5 }
		];
		state.activePlayer = 1;

		// P1 moves their R5 from (0, 2) to (2, 2)
		const move: MoveAction = {
			type: 'move',
			fromRow: 0,
			fromCol: 2,
			toRow: 2,
			toCol: 2
		};

		const { nextState } = applyMove(state, move);

		// Moving uncovered P2's piece at (0, 2), completing P2's line across row 0!
		expect(nextState.status.state).toBe('won');
		if (nextState.status.state === 'won') {
			expect(nextState.status.winner).toBe(2);
			expect(nextState.status.reason).toBe('reveal_line');
		}
	});

	it('no-reveal-win variant filters out moves that would uncover opponent win', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'), { noRevealWin: true });
		const state = createInitialState(config);

		state.board[0][0] = [{ id: 'p2-1', owner: 2, rank: 2 }];
		state.board[0][1] = [{ id: 'p2-2', owner: 2, rank: 3 }];
		state.board[0][2] = [
			{ id: 'p2-3', owner: 2, rank: 1 },
			{ id: 'p1-top', owner: 1, rank: 5 }
		];
		state.activePlayer = 1;

		const legalMoves = getLegalMoves(state);
		// Any move picking up from (0, 2) should NOT be legal in noRevealWin variant
		const revealsOpponent = legalMoves.some(
			(m) => m.type === 'move' && m.fromRow === 0 && m.fromCol === 2
		);
		expect(revealsOpponent).toBe(false);
	});
});

describe('Draw Conditions', () => {
	it('triggers draw on threefold repetition', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'));
		let state = createInitialState(config);

		// Place two pieces
		state = applyMove(state, {
			type: 'place',
			pieceId: state.reserves[1][0].id,
			toRow: 0,
			toCol: 0
		}).nextState;
		state = applyMove(state, {
			type: 'place',
			pieceId: state.reserves[2][0].id,
			toRow: 2,
			toCol: 2
		}).nextState;

		// Move P1 piece back and forth between (0,0) and (0,1)
		// Move P2 piece back and forth between (2,2) and (2,1)
		for (let cycle = 0; cycle < 3; cycle++) {
			state = applyMove(state, {
				type: 'move',
				fromRow: 0,
				fromCol: 0,
				toRow: 0,
				toCol: 1
			}).nextState;
			state = applyMove(state, {
				type: 'move',
				fromRow: 2,
				fromCol: 2,
				toRow: 2,
				toCol: 1
			}).nextState;
			state = applyMove(state, {
				type: 'move',
				fromRow: 0,
				fromCol: 1,
				toRow: 0,
				toCol: 0
			}).nextState;
			state = applyMove(state, {
				type: 'move',
				fromRow: 2,
				fromCol: 1,
				toRow: 2,
				toCol: 2
			}).nextState;
			if (state.status.state === 'draw') break;
		}

		expect(state.status.state).toBe('draw');
		if (state.status.state === 'draw') {
			expect(state.status.reason).toBe('threefold_repetition');
		}
	});

	it('triggers draw on move limit exhaustion', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'));
		config.moveLimit = 3;
		let state = createInitialState(config);

		state = applyMove(state, {
			type: 'place',
			pieceId: state.reserves[1][0].id,
			toRow: 0,
			toCol: 0
		}).nextState;
		state = applyMove(state, {
			type: 'place',
			pieceId: state.reserves[2][0].id,
			toRow: 0,
			toCol: 1
		}).nextState;
		state = applyMove(state, {
			type: 'place',
			pieceId: state.reserves[1][0].id,
			toRow: 1,
			toCol: 1
		}).nextState;

		expect(state.status.state).toBe('draw');
		if (state.status.state === 'draw') {
			expect(state.status.reason).toBe('move_limit');
		}
	});
});
