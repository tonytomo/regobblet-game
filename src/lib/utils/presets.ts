import type { BoardConfig, BoardPreset } from '#lib/types/game.js';

export const PRESETS: BoardPreset[] = [
	// 3x3 Presets
	{
		id: '3x3-default',
		name: '3×3 Standard',
		description: 'Fast, sharp, and tactical. The classic entry point.',
		boardSize: 3,
		winLength: 3,
		moveLimit: 50,
		distribution: [
			{ rank: 1, count: 1 },
			{ rank: 2, count: 1 },
			{ rank: 3, count: 1 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 }
		],
		notes: '6 pieces/player (ranks 1–6). 8 winning lines.'
	},
	{
		id: '3x3-balanced',
		name: '3×3 Balanced',
		description: 'Duplicates low ranks to provide cheap tempo moves and soften hoarding.',
		boardSize: 3,
		winLength: 3,
		moveLimit: 50,
		distribution: [
			{ rank: 1, count: 2 },
			{ rank: 2, count: 2 },
			{ rank: 3, count: 1 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 }
		],
		notes: '8 pieces/player (2× ranks 1–2, 1× ranks 3–6).'
	},
	{
		id: '3x3-beginner',
		name: '3×3 Beginner',
		description: 'Fewer ranks for quick learning with minimal cognitive load.',
		boardSize: 3,
		winLength: 3,
		moveLimit: 40,
		distribution: [
			{ rank: 1, count: 1 },
			{ rank: 2, count: 1 },
			{ rank: 3, count: 1 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 }
		],
		notes: '5 pieces/player (ranks 1–5).'
	},

	// 4x4 Presets
	{
		id: '4x4-fast',
		name: '4×4 Fast & Tactical',
		description: 'Recommended 4×4 mode! 3-in-a-row win condition keeps tension high.',
		boardSize: 4,
		winLength: 3,
		moveLimit: 60,
		distribution: [
			{ rank: 1, count: 1 },
			{ rank: 2, count: 1 },
			{ rank: 3, count: 1 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 },
			{ rank: 7, count: 1 },
			{ rank: 8, count: 1 },
			{ rank: 9, count: 1 }
		],
		notes: '9 pieces/player (ranks 1–9). 24 winning lines.'
	},
	{
		id: '4x4-strategic',
		name: '4×4 Strategic',
		description: 'Traditional 4-in-a-row. Slower, highly positional and defensive.',
		boardSize: 4,
		winLength: 4,
		moveLimit: 60,
		distribution: [
			{ rank: 1, count: 1 },
			{ rank: 2, count: 1 },
			{ rank: 3, count: 1 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 },
			{ rank: 7, count: 1 },
			{ rank: 8, count: 1 },
			{ rank: 9, count: 1 }
		],
		notes: '9 pieces/player (ranks 1–9). 10 winning lines.'
	},
	{
		id: '4x4-balanced',
		name: '4×4 Balanced',
		description: '12 pieces per player with duplicated low ranks to avoid top-rank freeze.',
		boardSize: 4,
		winLength: 3,
		moveLimit: 60,
		distribution: [
			{ rank: 1, count: 2 },
			{ rank: 2, count: 2 },
			{ rank: 3, count: 2 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 },
			{ rank: 7, count: 1 },
			{ rank: 8, count: 1 },
			{ rank: 9, count: 1 }
		],
		notes: '12 pieces/player (2× ranks 1–3, 1× ranks 4–9).'
	},

	// 5x5 Presets
	{
		id: '5x5-balanced',
		name: '5×5 Balanced Strategic',
		description: 'Strongly recommended for 5×5! Solves endgame hoarding with low-rank tempo.',
		boardSize: 5,
		winLength: 4,
		moveLimit: 80,
		distribution: [
			{ rank: 1, count: 2 },
			{ rank: 2, count: 2 },
			{ rank: 3, count: 2 },
			{ rank: 4, count: 2 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 },
			{ rank: 7, count: 1 },
			{ rank: 8, count: 1 },
			{ rank: 9, count: 1 },
			{ rank: 10, count: 1 },
			{ rank: 11, count: 1 },
			{ rank: 12, count: 1 }
		],
		notes: '16 pieces/player (2× ranks 1–4, 1× ranks 5–12). 28 winning lines.'
	},
	{
		id: '5x5-default',
		name: '5×5 Standard',
		description: 'Deep stack management and movement-focused endgame.',
		boardSize: 5,
		winLength: 4,
		moveLimit: 80,
		distribution: [
			{ rank: 1, count: 1 },
			{ rank: 2, count: 1 },
			{ rank: 3, count: 1 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 },
			{ rank: 7, count: 1 },
			{ rank: 8, count: 1 },
			{ rank: 9, count: 1 },
			{ rank: 10, count: 1 },
			{ rank: 11, count: 1 },
			{ rank: 12, count: 1 }
		],
		notes: '12 pieces/player (ranks 1–12). 28 winning lines.'
	},
	{
		id: '5x5-positional',
		name: '5×5 Positional Grind',
		description: '5-in-a-row victory on 25 squares. For patient, defensive tacticians.',
		boardSize: 5,
		winLength: 5,
		moveLimit: 100,
		distribution: [
			{ rank: 1, count: 1 },
			{ rank: 2, count: 1 },
			{ rank: 3, count: 1 },
			{ rank: 4, count: 1 },
			{ rank: 5, count: 1 },
			{ rank: 6, count: 1 },
			{ rank: 7, count: 1 },
			{ rank: 8, count: 1 },
			{ rank: 9, count: 1 },
			{ rank: 10, count: 1 },
			{ rank: 11, count: 1 },
			{ rank: 12, count: 1 }
		],
		notes: '5 in a row required (12 winning lines).'
	}
];

export function getPresetById(id: string): BoardPreset {
	const found = PRESETS.find((p) => p.id === id);
	if (!found) {
		return PRESETS[0];
	}
	return found;
}

export function createConfigFromPreset(
	preset: BoardPreset,
	variants: Partial<BoardConfig['variants']> = {}
): BoardConfig {
	return {
		size: preset.boardSize,
		winLength: preset.winLength,
		moveLimit: preset.moveLimit,
		distribution: preset.distribution,
		variants: {
			noRevealWin: variants.noRevealWin ?? false,
			noMoving: variants.noMoving ?? false,
			stackCap: variants.stackCap
		}
	};
}

