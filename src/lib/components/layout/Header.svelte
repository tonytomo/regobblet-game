<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import { settingsStore } from '#lib/stores/settingsStore.svelte.js';

	interface Props {
		onopenSetup?: () => void;
		onopenRules?: () => void;
		onopenOnline?: () => void;
	}

	let { onopenSetup, onopenRules, onopenOnline }: Props = $props();

	const config = $derived(gameStore.state.config);
	const isSoundOn = $derived(settingsStore.isSoundEnabled);
	const currentMode = $derived(gameStore.gameMode);
</script>

<header
	class="w-full border-b border-stone-800/80 bg-stone-900/60 px-4 py-3 backdrop-blur-md select-none sm:px-6"
>
	<div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
		<!-- Branding & Board Info -->
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<div
					class="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-teal-400 p-[1.5px] shadow-sm shadow-amber-900/40"
				>
					<div
						class="flex h-full w-full items-center justify-center rounded-[10px] bg-stone-900 text-sm font-black text-amber-400"
					>
						R
					</div>
				</div>
				<div class="flex flex-col">
					<div class="flex items-center gap-2">
						<span
							class="bg-gradient-to-r from-stone-100 via-stone-200 to-stone-400 bg-clip-text text-base font-extrabold tracking-tight text-transparent"
						>
							Regobblet
						</span>
						<span
							class="py-0.2 rounded-md border border-stone-700/50 bg-stone-800 px-1.5 text-[10px] font-bold tracking-wider text-stone-400 uppercase"
						>
							{config.size}×{config.size}
						</span>
					</div>
					<span class="hidden text-[11px] text-stone-400 sm:inline">
						Win: {config.winLength} in a row
					</span>
				</div>
			</div>
		</div>

		<!-- Action controls -->
		<div class="flex items-center gap-1.5 sm:gap-2">
			<!-- Sound Toggle -->
			<button
				type="button"
				onclick={() => settingsStore.toggleSound()}
				title={isSoundOn ? 'Mute Sound' : 'Unmute Sound'}
				class="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-800/80 hover:text-stone-100"
				aria-label={isSoundOn ? 'Sound is on' : 'Sound is muted'}
			>
				{#if isSoundOn}
					<svg
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
						/>
					</svg>
				{:else}
					<svg
						class="h-5 w-5 text-stone-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm11.414-4l4 4m0-4l-4 4"
						/>
					</svg>
				{/if}
			</button>

			<!-- Rules Button -->
			<Button
				variant="secondary"
				size="sm"
				onclick={onopenRules}
				title="View Game Rules & Variants"
			>
				<svg
					class="h-4 w-4 text-stone-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
				<span class="hidden sm:inline">Rules</span>
			</Button>

			<!-- Board Setup Button -->
			<Button
				variant="secondary"
				size="sm"
				onclick={onopenSetup}
				title="Change Board Size & Presets"
			>
				<svg
					class="h-4 w-4 text-stone-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
				<span class="hidden sm:inline">Setup</span>
			</Button>

			<!-- Online Room Button -->
			<Button
				variant={currentMode === 'online' ? 'accent' : 'secondary'}
				size="sm"
				onclick={onopenOnline}
				title="Play Online via WebSocket"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
					/>
				</svg>
				<span>Online</span>
			</Button>
		</div>
	</div>
</header>
