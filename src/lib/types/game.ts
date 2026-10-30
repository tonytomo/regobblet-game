export type PlayerId = 1 | 2;

export interface Piece {
	id: string;
	owner: PlayerId;
	rank: number; // 1 (smallest) up to 12 (largest)
}

export type BoardSquare = Piece[]; // stack from bottom (index 0) to top (last index)

export type BoardDimension = 3 | 4 | 5;

export interface BoardPreset {
	id: string;
	name: string;
	description: string;
	boardSize: BoardDimension;
	winLength: number;
	moveLimit: number;
	distribution: { rank: number; count: number }[];
	notes?: string;
}

export interface RuleVariants {
	noRevealWin: boolean; // Moving a piece that reveals an opponent's line is illegal
	noMoving: boolean; // Pure gobbling (placement only; moving top pieces disabled)
	stackCap?: number; // Optional maximum stack height
}

export interface BoardConfig {
	size: BoardDimension;
	winLength: number;
	moveLimit: number;
	distribution: { rank: number; count: number }[];
	variants: RuleVariants;
}

export type MoveAction =
	| {
			type: 'place';
			pieceId: string;
			toRow: number;
			toCol: number;
	  }
	| {
			type: 'move';
			fromRow: number;
			fromCol: number;
			toRow: number;
			toCol: number;
	  };

export interface WinningLine {
	cells: [number, number][];
	owner: PlayerId;
	direction: 'row' | 'col' | 'diag-main' | 'diag-anti';
}

export type GameStatus =
	| { state: 'playing' }
	| {
			state: 'won';
			winner: PlayerId;
			line: WinningLine;
			reason: 'line' | 'reveal_line';
	  }
	| {
			state: 'draw';
			reason: 'threefold_repetition' | 'move_limit' | 'stalemate';
	  };

export interface MoveRecord {
	action: MoveAction;
	player: PlayerId;
	piece: Piece;
	coveredPiece?: Piece;
	uncoveredPiece?: Piece;
	notation: string;
	turnNumber: number;
}

export interface GameState {
	board: BoardSquare[][];
	reserves: {
		1: Piece[];
		2: Piece[];
	};
	activePlayer: PlayerId;
	moveCount: number; // consecutive moves count toward move limit
	totalTurns: number;
	config: BoardConfig;
	status: GameStatus;
	history: MoveRecord[];
	positionHistory: Map<string, number>; // state key -> count for threefold repetition
	lastMove?: MoveAction;
}
