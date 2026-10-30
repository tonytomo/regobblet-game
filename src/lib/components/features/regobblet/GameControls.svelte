<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { gameStore, type GameMode } from '#lib/stores/gameStore.svelte.js';
	import { onlineStore } from '#lib/stores/onlineStore.svelte.js';
	import type { AiDifficulty } from '#lib/utils/aiBot.js';

	interface Props {
		onopenOnline?: () => void;
	}

	let { onopenOnline }: Props = $props();

	const state = $derived(gameStore.state);
	const active = $derived(state.activePlayer);
	const gameMode = $derived(gameStore.gameMode);
	const aiDifficulty = $derived(gameStore.aiDifficulty);
	const isAiThinking = $derived(gameStore.isAiThinking);
	const canUndo = $derived(gameStore.canUndo);
	const canRedo = $derived(gameStore.canRedo);
	const onlineRole = $derived(gameStore.onlineRole);

	const isBotTurn = $derived(
		gameMode === 'ai' && active === gameStore.aiPlayer && state.status.state === 'playing'
	);

	function handleModeChange(mode: GameMode) {
		if (mode === 'online') {
			if (!onlineStore.currentRoom) {
				onopenOnline?.();
			} else {
				gameStore.setGameMode('online');
			}
		} else {
			if (gameStore.gameMode === 'online' && onlineStore.currentRoom) {
				onlineStore.leaveRoom().catch(() => {});
			}
			gameStore.setGameMode(mode);
		}
	}

	function handleDifficultyChange(diff: AiDifficulty) {
		gameStore.setAiDifficulty(diff);
	}

	function handleRestart() {
		if (gameMode === 'online') {
			onlineStore.sendRestart().catch(() => {});
		} else {
			gameStore.resetCurrentGame();
		}
	}
</script>

<div class="mx-auto flex w-full max-w-[500px] flex-col gap-2.5 select-none">
	<!-- Turn Banner & Stats -->
	<div
		class="flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/80 px-3 py-2 shadow-sm"
	>
		<div class="flex items-center gap-2">
			{#if state.status.state === 'playing'}
				{#if gameMode === 'online' && onlineRole !== null}
					{#if active === onlineRole}
						<Badge variant={active === 1 ? 'player1' : 'player2'} size="md">
							<span
								class="inline-block h-2 w-2 rounded-full {active === 1
									? 'bg-amber-400'
									: 'bg-teal-400'}"
							></span>
							Your Turn (Player {active})
						</Badge>
					{:else}
						<Badge variant="neutral" size="md">
							<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-stone-400"></span>
							Opponent's Turn (Player {active})...
						</Badge>
					{/if}
				{:else if isBotTurn}
					<Badge variant="player2" size="md">
						<span class="inline-block h-2 w-2 animate-ping rounded-full bg-teal-400"></span>
						AI thinking ({aiDifficulty})...
					</Badge>
				{:else if active === 1}
					<Badge variant="player1" size="md">
						<span class="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
						Player 1's Turn
					</Badge>
				{:else}
					<Badge variant="player2" size="md">
						<span class="inline-block h-2 w-2 rounded-full bg-teal-400"></span>
						Player 2's Turn
					</Badge>
				{/if}
			{:else if state.status.state === 'won'}
				<Badge variant={state.status.winner === 1 ? 'player1' : 'player2'} size="md">
					Player {state.status.winner} Wins!
				</Badge>
			{:else}
				<Badge variant="neutral" size="md">
					Game Draw ({state.status.reason.replace('_', ' ')})
				</Badge>
			{/if}
		</div>

		<!-- Move Limit Tracker -->
		<div class="flex items-center gap-1.5 font-mono text-xs text-stone-400">
			<span>Moves:</span>
			<span class="font-bold text-stone-200">{state.moveCount}</span>
			<span class="text-stone-500">/</span>
			<span>{state.config.moveLimit}</span>
		</div>
	</div>

	<!-- Online Room Status Banner (when in online mode) -->
	{#if gameMode === 'online' && onlineStore.currentRoom}
		<div
			class="flex items-center justify-between rounded-xl border border-teal-800/60 bg-teal-950/40 px-3 py-1.5 text-xs shadow-xs"
		>
			<div class="flex items-center gap-2">
				<span
					class="h-2 w-2 rounded-full {onlineStore.isOpponentPresent
						? 'bg-emerald-400'
						: 'animate-ping bg-amber-400'}"
				></span>
				<span class="font-mono text-stone-300">
					Room: <strong class="text-teal-300">{onlineStore.currentRoom}</strong>
				</span>
				<span class="text-[10px] text-stone-400">
					({onlineStore.selfRole === 1 ? 'Host' : 'Guest'})
				</span>
			</div>
			<div class="flex items-center gap-1.5">
				<button
					type="button"
					onclick={onopenOnline}
					class="hover:bg-stone-750 cursor-pointer rounded-lg bg-stone-800 px-2 py-0.5 text-[11px] text-stone-300 transition-colors"
				>
					Room Info
				</button>
				<button
					type="button"
					onclick={() => onlineStore.leaveRoom()}
					class="cursor-pointer rounded-lg border border-rose-800/60 bg-rose-950/80 px-2 py-0.5 text-[11px] text-rose-300 transition-colors hover:bg-rose-900"
				>
					Leave
				</button>
			</div>
		</div>
	{/if}

	<!-- Mode Selector Tabs & AI Difficulty -->
	<div class="flex flex-wrap items-center justify-between gap-2">
		<!-- Game Mode Selector -->
		<div
			class="inline-flex rounded-xl border border-stone-800 bg-stone-900 p-1 text-xs font-semibold"
		>
			<button
				type="button"
				onclick={() => handleModeChange('ai')}
				class="cursor-pointer rounded-lg px-2.5 py-1 transition-colors {gameMode === 'ai'
					? 'bg-amber-600 text-white shadow-xs'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				Solo vs AI
			</button>
			<button
				type="button"
				onclick={() => handleModeChange('pass-and-play')}
				class="cursor-pointer rounded-lg px-2.5 py-1 transition-colors {gameMode === 'pass-and-play'
					? 'bg-amber-600 text-white shadow-xs'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				Pass & Play
			</button>
			<button
				type="button"
				onclick={() => handleModeChange('online')}
				class="cursor-pointer rounded-lg px-2.5 py-1 transition-colors {gameMode === 'online'
					? 'bg-teal-600 text-white shadow-xs'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				Online Room
			</button>
		</div>

		<!-- AI Difficulty Selector (when in AI mode) -->
		{#if gameMode === 'ai'}
			<div
				class="inline-flex rounded-xl border border-stone-800 bg-stone-900 p-1 text-[11px] font-semibold"
			>
				<button
					type="button"
					onclick={() => handleDifficultyChange('easy')}
					class="cursor-pointer rounded-md px-2 py-0.5 transition-colors {aiDifficulty === 'easy'
						? 'bg-stone-700 text-stone-100'
						: 'text-stone-400 hover:text-stone-200'}"
				>
					Novice
				</button>
				<button
					type="button"
					onclick={() => handleDifficultyChange('medium')}
					class="cursor-pointer rounded-md px-2 py-0.5 transition-colors {aiDifficulty === 'medium'
						? 'bg-stone-700 text-stone-100'
						: 'text-stone-400 hover:text-stone-200'}"
				>
					Tactician
				</button>
				<button
					type="button"
					onclick={() => handleDifficultyChange('hard')}
					class="cursor-pointer rounded-md px-2 py-0.5 transition-colors {aiDifficulty === 'hard'
						? 'bg-stone-700 text-stone-100'
						: 'text-stone-400 hover:text-stone-200'}"
				>
					Master
				</button>
			</div>
		{/if}
	</div>

	<!-- Bottom Action Bar: Undo, Redo, Restart -->
	<div class="flex items-center justify-between gap-2">
		<div class="flex items-center gap-1.5">
			<Button
				variant="secondary"
				size="sm"
				disabled={!canUndo || isAiThinking}
				onclick={() => gameStore.undo()}
				title="Undo Move"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 10h10a5 5 0 015 5v2m0 0l-4-4m4 4l4-4"
					/>
				</svg>
				<span>Undo</span>
			</Button>

			<Button
				variant="secondary"
				size="sm"
				disabled={!canRedo || isAiThinking}
				onclick={() => gameStore.redo()}
				title="Redo Move"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 10H11a5 5 0 00-5 5v2m0 0l4-4m-4 4l-4-4"
					/>
				</svg>
				<span>Redo</span>
			</Button>
		</div>

		<Button
			variant="secondary"
			size="sm"
			disabled={isAiThinking}
			onclick={handleRestart}
			title="Restart Current Board"
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
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</svg>
			<span>Restart</span>
		</Button>
	</div>
</div>
