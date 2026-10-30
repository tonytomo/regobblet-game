import { sounds } from '#lib/utils/sound.js';

export type PieceTheme = 'matryoshka' | 'minimal' | 'modern';
export type StackIndicatorStyle = 'pips' | 'badge' | 'both' | 'none';

interface SettingsState {
	isSoundEnabled: boolean;
	theme: PieceTheme;
	stackIndicator: StackIndicatorStyle;
	serverUrl: string;
	apiKey: string;
}

const STORAGE_KEY = 'regobblet_settings';

function loadInitialSettings(): SettingsState {
	const defaultSettings: SettingsState = {
		isSoundEnabled: true,
		theme: 'matryoshka',
		stackIndicator: 'both',
		serverUrl: 'ws://localhost:18080/ws',
		apiKey: ''
	};

	if (typeof window === 'undefined') {
		return defaultSettings;
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return { ...defaultSettings, ...parsed };
		}
	} catch {
		// Ignore local storage error
	}

	return defaultSettings;
}

export function createSettingsStore() {
	const initial = loadInitialSettings();
	let isSoundEnabled = $state<boolean>(initial.isSoundEnabled);
	let theme = $state<PieceTheme>(initial.theme);
	let stackIndicator = $state<StackIndicatorStyle>(initial.stackIndicator);
	let serverUrl = $state<string>(initial.serverUrl);
	let apiKey = $state<string>(initial.apiKey);

	// Sync initial sound state
	sounds.setEnabled(initial.isSoundEnabled);

	function persist(): void {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					isSoundEnabled,
					theme,
					stackIndicator,
					serverUrl,
					apiKey
				})
			);
		} catch {
			// ignore storage errors
		}
	}

	return {
		get isSoundEnabled() {
			return isSoundEnabled;
		},
		get theme() {
			return theme;
		},
		get stackIndicator() {
			return stackIndicator;
		},
		get serverUrl() {
			return serverUrl;
		},
		get apiKey() {
			return apiKey;
		},
		setSoundEnabled(val: boolean) {
			isSoundEnabled = val;
			sounds.setEnabled(val);
			persist();
		},
		toggleSound() {
			isSoundEnabled = !isSoundEnabled;
			sounds.setEnabled(isSoundEnabled);
			persist();
		},
		setTheme(val: PieceTheme) {
			theme = val;
			persist();
		},
		setStackIndicator(val: StackIndicatorStyle) {
			stackIndicator = val;
			persist();
		},
		setServerUrl(val: string) {
			serverUrl = val;
			persist();
		},
		setApiKey(val: string) {
			apiKey = val;
			persist();
		}
	};
}

export const settingsStore = createSettingsStore();
