import { describe, it, expect } from 'vitest';
import { createInitialState, applyMove, getLegalMoves } from './gameRules.js';
import { createConfigFromPreset, getPresetById } from './presets.js';
import { selectBotMove } from './aiBot.js';

describe('AI Bot Logic', () => {
	it('generates a legal move for an active game', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'));
		const state = createInitialState(config);

		const easyMove = selectBotMove(state, 'easy');
		const mediumMove = selectBotMove(state, 'medium');
		const hardMove = selectBotMove(state, 'hard');

		expect(easyMove).not.toBeNull();
		expect(mediumMove).not.toBeNull();
		expect(hardMove).not.toBeNull();

		const legalMoves = getLegalMoves(state);
		expect(
			legalMoves.some(
				(m) =>
					m.type === easyMove?.type && m.toRow === easyMove?.toRow && m.toCol === easyMove?.toCol
			)
		).toBe(true);
		expect(
			legalMoves.some(
				(m) =>
					m.type === mediumMove?.type &&
					m.toRow === mediumMove?.toRow &&
					m.toCol === mediumMove?.toCol
			)
		).toBe(true);
		expect(
			legalMoves.some(
				(m) =>
					m.type === hardMove?.type && m.toRow === hardMove?.toRow && m.toCol === hardMove?.toCol
			)
		).toBe(true);
	});

	it('seizes an immediate 1-move win', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'));
		const state = createInitialState(config);

		// Give Bot (P2) two in a row on row 1: (1, 0) and (1, 1). Square (1, 2) is empty.
		state.board[1][0] = [{ id: 'p2-1', owner: 2, rank: 2 }];
		state.board[1][1] = [{ id: 'p2-2', owner: 2, rank: 3 }];
		state.activePlayer = 2;

		const botMove = selectBotMove(state, 'medium');
		expect(botMove).not.toBeNull();
		expect(botMove?.toRow).toBe(1);
		expect(botMove?.toCol).toBe(2);

		const { nextState } = applyMove(state, botMove!);
		expect(nextState.status.state).toBe('won');
		if (nextState.status.state === 'won') {
			expect(nextState.status.winner).toBe(2);
		}
	});

	it('blocks an opponent immediate win on Medium and Hard', () => {
		const config = createConfigFromPreset(getPresetById('3x3-default'));
		const state = createInitialState(config);

		// Opponent (P1) has two in a row on row 0: (0, 0) and (0, 1). Winning square is (0, 2).
		state.board[0][0] = [{ id: 'p1-1', owner: 1, rank: 2 }];
		state.board[0][1] = [{ id: 'p1-2', owner: 1, rank: 3 }];
		state.activePlayer = 2;

		const mediumMove = selectBotMove(state, 'medium');
		expect(mediumMove).not.toBeNull();
		expect(mediumMove?.toRow).toBe(0);
		expect(mediumMove?.toCol).toBe(2);
	});
});
