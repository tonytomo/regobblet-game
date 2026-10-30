import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	WS_URL: {
		public: true,
		schema: (value) => value || 'ws://localhost:18080/ws',
		description: 'Universal WebSocket Server URL for online multiplayer'
	}
});

