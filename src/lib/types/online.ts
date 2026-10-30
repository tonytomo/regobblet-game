import type { BoardConfig, MoveAction, PlayerId } from './game.js';

export interface RoomMetadata {
	host: string;
	config: BoardConfig;
	player1: string;
	player2?: string;
	isStarted: boolean;
}

export type WireMessage =
	| {
			type: 'guest_ready';
			sender: string;
	  }
	| {
			type: 'game_init';
			config: BoardConfig;
			player1Id?: string;
			player2Id?: string;
	  }
	| {
			type: 'config_change';
			config: BoardConfig;
	  }
	| {
			type: 'move';
			action: MoveAction;
			player: PlayerId;
			seq: number;
	  }
	| {
			type: 'restart_request';
			from: PlayerId;
	  }
	| {
			type: 'restart_accept';
	  }
	| {
			type: 'resign';
			player: PlayerId;
	  }
	| {
			type: 'chat';
			sender: string;
			text: string;
			timestamp: number;
	  };

export interface OnlineConnectionState {
	isConnected: boolean;
	isConnecting: boolean;
	roomId?: string;
	selfRole?: PlayerId;
	opponentLabel?: string;
	serverUrl: string;
	error?: string;
}
