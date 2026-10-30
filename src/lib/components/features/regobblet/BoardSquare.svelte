<script lang="ts">
	import type { BoardSquare as BoardSquareType } from '#lib/types/game.js';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import { settingsStore } from '#lib/stores/settingsStore.svelte.js';
	import { getTopPiece } from '#lib/utils/gameRules.js';
	import PieceComponent from './Piece.svelte';

	interface Props {
		row: number;
		col: number;
		square: BoardSquareType;
		isValidTarget: boolean;
		isLastMoveSource: boolean;
		isLastMoveDest: boolean;
		maxRank: number;
		oninspect?: () => void;
	}

	let {
		row,
		col,
		square,
		isValidTarget,
		isLastMoveSource,
		isLastMoveDest,
		maxRank,
		oninspect
	}: Props = $props();

	let isDragOver = $state<boolean>(false);

	const topPiece = $derived(getTopPiece(square));
	const stackHeight = $derived(square.length);
	const stackIndicatorStyle = $derived(settingsStore.stackIndicator);
	const selected = $derived(gameStore.selected);

	const isSquareSelected = $derived(
		selected?.source === 'board' && selected.fromRow === row && selected.fromCol === col
	);

	function handleClick() {
		gameStore.handleSquareClick(row, col);
	}

	function handleDragOver(e: DragEvent) {
		if (!isValidTarget) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		if (isValidTarget) {
			gameStore.handleSquareClick(row, col);
		}
	}

	function handleDragStart(e: DragEvent) {
		if (!topPiece || topPiece.owner !== gameStore.state.activePlayer) return;
		if (gameStore.state.config.variants.noMoving) return;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', `board:${row}:${col}`);
		}
		gameStore.handleSquareClick(row, col);
	}
</script>

<div
	role="button"
	tabindex="0"
	aria-label="Square {String.fromCharCode(65 + col)}{row + 1}: {topPiece
		? `Player ${topPiece.owner} Rank ${topPiece.rank}, stack depth ${stackHeight}`
		: 'Empty'}"
	onclick={handleClick}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	class="relative flex aspect-square cursor-pointer items-center justify-center rounded-2xl p-1.5 transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:p-2
		{isSquareSelected ? 'bg-stone-700/80 ring-2 ring-amber-400' : 'bg-stone-850 hover:bg-stone-800/90'}
		{isLastMoveDest ? 'ring-2 ring-amber-500/60' : ''}
		{isLastMoveSource ? 'ring-1 ring-stone-600/60' : ''}
		{isValidTarget ? 'ring-dashed bg-teal-950/20 ring-2 ring-teal-400/90 hover:bg-teal-900/30' : ''}
		{isDragOver ? 'scale-105 bg-teal-900/40 ring-4 ring-teal-300' : ''}
		border-stone-750/70 border shadow-inner"
>
	<!-- Coordinate watermark (e.g. A1, B2) in corner -->
	<span
		class="pointer-events-none absolute top-1 left-1.5 font-mono text-[9px] font-medium text-stone-400/60"
	>
		{String.fromCharCode(65 + col)}{row + 1}
	</span>

	<!-- Target placement prompt icon when empty square is valid target -->
	{#if isValidTarget && !topPiece}
		<div
			class="pointer-events-none h-4 w-4 animate-pulse rounded-full border-2 border-dashed border-teal-400/70"
		></div>
	{/if}

	<!-- Top Piece -->
	{#if topPiece}
		<div class="flex h-full w-full items-center justify-center">
			<PieceComponent
				piece={topPiece}
				{maxRank}
				isSelected={isSquareSelected}
				isInteractive={topPiece.owner === gameStore.state.activePlayer &&
					!gameStore.state.config.variants.noMoving}
				ondragstart={handleDragStart}
			/>
		</div>
	{/if}

	<!-- Stack Indicator (Pips & Badge) -->
	{#if stackHeight > 1}
		<div class="absolute right-1 bottom-1 z-10 flex items-center gap-1">
			<!-- Pips -->
			{#if stackIndicatorStyle === 'pips' || stackIndicatorStyle === 'both'}
				<div class="flex items-center gap-0.5">
					{#each Array.from({ length: Math.min(stackHeight, 5) }, (unused, i) => i) as i (i)}
						<div
							class="h-1 w-1 rounded-full {i === stackHeight - 1 ? 'bg-amber-400' : 'bg-stone-500'}"
						></div>
					{/each}
				</div>
			{/if}

			<!-- Inspect Badge -->
			{#if stackIndicatorStyle === 'badge' || stackIndicatorStyle === 'both'}
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						oninspect?.();
					}}
					title="Inspect Stack ({stackHeight} pieces)"
					class="py-0.2 cursor-pointer rounded-md border border-stone-700/60 bg-stone-900/90 px-1 text-[10px] font-bold text-stone-300 shadow-xs hover:bg-stone-700"
				>
					×{stackHeight}
				</button>
			{/if}
		</div>
	{/if}
</div>
