<script lang="ts">
	import type { Piece } from '#lib/types/game.js';

	interface Props {
		piece: Piece;
		isSelected?: boolean;
		isInteractive?: boolean;
		maxRank?: number;
		class?: string;
		ondragstart?: (e: DragEvent) => void;
		ondragend?: (e: DragEvent) => void;
	}

	let {
		piece,
		isSelected = false,
		isInteractive = false,
		maxRank = 6,
		class: className = '',
		ondragstart,
		ondragend
	}: Props = $props();

	// Calculate proportional diameter based on rank relative to maxRank
	// Rank 1 starts at ~60% size, maxRank reaches 96% of square
	const normalizedScale = $derived.by(() => {
		const clampedMax = Math.max(6, maxRank);
		const fraction = (piece.rank - 1) / (clampedMax - 1 || 1);
		// Scale range: 0.62 to 0.96
		return 0.62 + fraction * 0.34;
	});

	const isP1 = $derived(piece.owner === 1);
</script>

<div
	role="img"
	aria-label="Player {piece.owner} Rank {piece.rank} Piece"
	draggable={isInteractive}
	{ondragstart}
	{ondragend}
	style="transform: scale({normalizedScale});"
	class="relative flex aspect-square h-full w-full items-center justify-center rounded-full shadow-md transition-transform duration-200 select-none
		{isP1
		? 'border-2 border-amber-300 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 text-stone-900 shadow-amber-950/60'
		: 'border-2 border-teal-300 bg-gradient-to-b from-teal-400 via-teal-600 to-cyan-900 text-white shadow-teal-950/60'}
		{isSelected ? 'z-20 scale-105 shadow-xl ring-4 ring-white ring-offset-2 ring-offset-stone-900' : ''}
		{isInteractive ? 'cursor-grab hover:brightness-110 active:scale-95 active:cursor-grabbing' : ''}
		{className}"
>
	<!-- Inner 3D doll depth concentric bevel -->
	<div
		class="absolute inset-[12%] flex items-center justify-center rounded-full border border-black/20
			{isP1
			? 'bg-gradient-to-tr from-amber-600 to-amber-500 shadow-inner'
			: 'bg-gradient-to-tr from-teal-700 to-teal-500 shadow-inner'}"
	>
		<!-- Center core with rank number -->
		<div
			class="flex h-[62%] w-[62%] items-center justify-center rounded-full text-xs font-black tracking-tight drop-shadow-xs sm:text-sm
				{isP1 ? 'bg-amber-300/90 text-amber-950' : 'bg-teal-200/90 text-teal-950'}"
		>
			{piece.rank}
		</div>
	</div>

	<!-- Top specular highlight gloss -->
	<div
		class="pointer-events-none absolute top-1 right-2 left-2 h-1/4 rounded-t-full bg-gradient-to-b from-white/40 to-transparent"
	></div>
</div>
