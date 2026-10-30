<script lang="ts">
	import type { Piece, PlayerId } from '#lib/types/game.js';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import PieceComponent from './Piece.svelte';

	interface Props {
		owner: PlayerId;
		label?: string;
	}

	let { owner, label }: Props = $props();

	const state = $derived(gameStore.state);
	const reserve = $derived(state.reserves[owner]);
	const selected = $derived(gameStore.selected);
	const isOwnerTurn = $derived(state.activePlayer === owner && state.status.state === 'playing');
	const canInteract = $derived(
		isOwnerTurn &&
			!gameStore.isAiThinking &&
			(gameStore.gameMode !== 'online' ||
				gameStore.onlineRole === null ||
				gameStore.onlineRole === owner) &&
			(gameStore.gameMode !== 'ai' || gameStore.aiPlayer !== owner)
	);

	const maxRank = $derived.by(() => {
		let highest = 6;
		for (const dist of state.config.distribution) {
			if (dist.rank > highest) highest = dist.rank;
		}
		return highest;
	});

	// Group reserve pieces by rank to show duplicates cleanly with counts
	const groupedRanks = $derived.by(() => {
		const groups: Record<number, Piece[]> = {};
		for (const p of reserve) {
			if (!groups[p.rank]) {
				groups[p.rank] = [];
			}
			groups[p.rank].push(p);
		}
		return Object.entries(groups)
			.map(([rankStr, pieces]) => ({ rank: Number(rankStr), pieces, count: pieces.length }))
			.sort((a, b) => a.rank - b.rank);
	});

	function handlePieceClick(piece: Piece) {
		if (!canInteract) return;
		gameStore.selectReservePiece(piece);
	}

	function handleDragStart(e: DragEvent, piece: Piece) {
		if (!canInteract || piece.owner !== state.activePlayer) return;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', `reserve:${piece.id}`);
		}
		gameStore.selectReservePiece(piece);
	}
</script>

<div
	class="mx-auto w-full max-w-[500px] rounded-2xl p-2 transition-all duration-200 select-none sm:p-2.5
		{isOwnerTurn
		? owner === 1
			? 'border-2 border-amber-500/50 bg-amber-950/25 shadow-md shadow-amber-950/20'
			: 'border-2 border-teal-500/50 bg-teal-950/25 shadow-md shadow-teal-950/20'
		: 'border border-stone-800 bg-stone-900/60'}"
>
	<!-- Tray Header -->
	<div class="mb-1.5 flex items-center justify-between px-2 text-xs">
		<div class="flex items-center gap-2">
			<span
				class="h-2.5 w-2.5 rounded-full {owner === 1 ? 'bg-amber-500' : 'bg-teal-400'} {isOwnerTurn
					? 'animate-ping'
					: ''}"
			></span>
			<span class="font-bold tracking-tight {owner === 1 ? 'text-amber-400' : 'text-teal-400'}">
				{label || `Player ${owner}`}
			</span>
			{#if isOwnerTurn}
				<span
					class="py-0.2 rounded border border-stone-700/60 bg-stone-800 px-1.5 text-[10px] font-semibold tracking-wider text-stone-300 uppercase"
				>
					Active Turn
				</span>
			{/if}
		</div>
		<span class="text-[11px] font-medium text-stone-400">
			{reserve.length}
			{reserve.length === 1 ? 'piece' : 'pieces'} remaining
		</span>
	</div>

	<!-- Pieces Rack -->
	<div
		class="flex items-center justify-start gap-1.5 overflow-x-auto px-1 py-1 sm:justify-center sm:gap-2"
	>
		{#if groupedRanks.length === 0}
			<div class="w-full py-2 text-center text-xs text-stone-500 italic">
				Reserve empty — must move pieces on board
			</div>
		{:else}
			{#each groupedRanks as group (group.rank)}
				{@const representativePiece = group.pieces[0]}
				{@const isGroupSelected = selected?.piece.id === representativePiece.id}

				<div class="relative flex aspect-square w-10 shrink-0 items-center justify-center sm:w-12">
					<button
						type="button"
						onclick={() => handlePieceClick(representativePiece)}
						disabled={!canInteract}
						class="h-full w-full cursor-pointer rounded-full p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
						aria-label="Select rank {group.rank} piece ({group.count} remaining)"
					>
						<PieceComponent
							piece={representativePiece}
							{maxRank}
							isSelected={isGroupSelected}
							isInteractive={canInteract}
							ondragstart={(e) => handleDragStart(e, representativePiece)}
						/>
					</button>

					<!-- Duplicate count badge -->
					{#if group.count > 1}
						<span
							class="py-0.2 pointer-events-none absolute -top-1 -right-1 rounded-full border border-stone-700 bg-stone-900 px-1.5 text-[9px] font-black text-stone-200 shadow-xs"
						>
							×{group.count}
						</span>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
