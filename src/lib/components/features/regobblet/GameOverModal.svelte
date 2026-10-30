<script lang="ts">
	import Modal from '#lib/components/ui/Modal.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import { onlineStore } from '#lib/stores/onlineStore.svelte.js';

	interface Props {
		onopenSetup?: () => void;
	}

	let { onopenSetup }: Props = $props();

	let isDismissed = $state<boolean>(false);

	const gameState = $derived(gameStore.state);
	const status = $derived(gameState.status);
	const isGameOver = $derived(status.state !== 'playing');
	const isOpen = $derived(isGameOver && !isDismissed);

	// Reset dismissal when game starts playing again
	$effect(() => {
		if (status.state === 'playing') {
			isDismissed = false;
		}
	});

	function handleRematch() {
		if (gameStore.gameMode === 'online') {
			onlineStore.sendRestart().catch(() => {});
		} else {
			gameStore.resetCurrentGame();
		}
		isDismissed = false;
	}

	function handleChangeSetup() {
		isDismissed = true;
		onopenSetup?.();
	}
</script>

<Modal
	{isOpen}
	title={status.state === 'won' ? 'Victory!' : 'Game Over'}
	maxWidth="sm"
	onclose={() => (isDismissed = true)}
>
	<div class="flex flex-col items-center gap-3 py-2 text-center">
		{#if status.state === 'won'}
			<!-- Trophy / Star Icon -->
			<div
				class="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg
					{status.winner === 1
					? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 shadow-amber-950/50'
					: 'bg-gradient-to-tr from-teal-600 to-cyan-400 text-stone-950 shadow-teal-950/50'}"
			>
				<svg class="h-9 w-9" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					/>
				</svg>
			</div>

			<h3 class="text-xl font-black text-stone-100">
				Player {status.winner} Wins!
			</h3>

			<p class="text-xs text-stone-300">
				{#if status.reason === 'reveal_line'}
					<span class="font-bold text-amber-400">Signature Gobblet Reveal!</span>
					<br />
					The opponent moved a piece that uncovered a winning line!
				{:else}
					Completed a winning line of {gameState.config.winLength} in a row.
				{/if}
			</p>
		{:else if status.state === 'draw'}
			<div
				class="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 text-stone-400 shadow-lg"
			>
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8m-8 5h8m-8 5h8" />
				</svg>
			</div>

			<h3 class="text-xl font-black text-stone-100">Game Drawn</h3>

			<p class="text-xs text-stone-300">
				{#if status.reason === 'threefold_repetition'}
					Threefold repetition: the exact same position occurred three times.
				{:else if status.reason === 'move_limit'}
					Move limit reached ({gameState.config.moveLimit} moves without a win).
				{:else}
					Stalemate: active player has no legal moves remaining.
				{/if}
			</p>
		{/if}

		<div
			class="mt-2 flex w-full justify-around rounded-xl border border-stone-800 bg-stone-950/60 p-2.5 text-xs"
		>
			<div class="flex flex-col">
				<span class="font-mono text-[10px] text-stone-500">TOTAL TURNS</span>
				<span class="font-bold text-stone-200">{gameState.totalTurns}</span>
			</div>
			<div class="flex flex-col">
				<span class="font-mono text-[10px] text-stone-500">BOARD</span>
				<span class="font-bold text-stone-200">{gameState.config.size}×{gameState.config.size}</span
				>
			</div>
			<div class="flex flex-col">
				<span class="font-mono text-[10px] text-stone-500">WIN TARGET</span>
				<span class="font-bold text-stone-200">{gameState.config.winLength}</span>
			</div>
		</div>
	</div>

	{#snippet footer()}
		<Button variant="secondary" size="md" onclick={handleChangeSetup}>Change Rules</Button>
		<Button variant="primary" size="md" onclick={handleRematch}>Play Again</Button>
	{/snippet}
</Modal>
