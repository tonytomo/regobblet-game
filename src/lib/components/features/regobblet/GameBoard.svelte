<script lang="ts">
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import BoardSquareComponent from './BoardSquare.svelte';

	interface Props {
		oninspect?: (row: number, col: number) => void;
	}

	let { oninspect }: Props = $props();

	const state = $derived(gameStore.state);
	const size = $derived(state.config.size);
	const lastMove = $derived(state.lastMove);
	const validTargets = $derived(gameStore.validTargetSquares);

	const maxRank = $derived.by(() => {
		let highest = 6;
		for (const dist of state.config.distribution) {
			if (dist.rank > highest) highest = dist.rank;
		}
		return highest;
	});

	const gridColClass = $derived.by(() => {
		if (size === 3) return 'grid-cols-3';
		if (size === 4) return 'grid-cols-4';
		return 'grid-cols-5';
	});

	// SVG winning line calculation
	const winningLineCoords = $derived.by(() => {
		if (state.status.state !== 'won') return null;
		const cells = state.status.line.cells;
		if (cells.length < 2) return null;

		const start = cells[0];
		const end = cells[cells.length - 1];

		const x1 = ((start[1] + 0.5) / size) * 100;
		const y1 = ((start[0] + 0.5) / size) * 100;
		const x2 = ((end[1] + 0.5) / size) * 100;
		const y2 = ((end[0] + 0.5) / size) * 100;

		const winner = state.status.winner;
		return { x1, y1, x2, y2, winner };
	});
</script>

<div
	class="border-stone-750 relative mx-auto aspect-square w-full max-w-[500px] rounded-3xl border bg-stone-900/90 p-2 shadow-2xl backdrop-blur-md select-none sm:p-3"
>
	<!-- The Grid -->
	<div class="grid h-full w-full {gridColClass} gap-1.5 sm:gap-2.5">
		{#each state.board as rowCells, r (r)}
			{#each rowCells as square, c (`${r}-${c}`)}
				{@const isValid = validTargets.some(([tr, tc]) => tr === r && tc === c)}
				{@const isLastDest = lastMove?.toRow === r && lastMove?.toCol === c}
				{@const isLastSource =
					lastMove?.type === 'move' && lastMove.fromRow === r && lastMove.fromCol === c}

				<BoardSquareComponent
					row={r}
					col={c}
					{square}
					isValidTarget={isValid}
					isLastMoveDest={isLastDest}
					isLastMoveSource={isLastSource}
					{maxRank}
					oninspect={() => oninspect?.(r, c)}
				/>
			{/each}
		{/each}
	</div>

	<!-- SVG Winning Line Overlay -->
	{#if winningLineCoords}
		<svg
			class="pointer-events-none absolute inset-2 z-30 h-[calc(100%-16px)] w-[calc(100%-16px)] overflow-visible sm:inset-3 sm:h-[calc(100%-24px)] sm:w-[calc(100%-24px)]"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
		>
			<defs>
				<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation="3" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<!-- Line outer glow -->
			<line
				x1="{winningLineCoords.x1}%"
				y1="{winningLineCoords.y1}%"
				x2="{winningLineCoords.x2}%"
				y2="{winningLineCoords.y2}%"
				stroke={winningLineCoords.winner === 1 ? '#f59e0b' : '#14b8a6'}
				stroke-width="9"
				stroke-linecap="round"
				stroke-opacity="0.4"
				filter="url(#glow)"
			/>

			<!-- Line core -->
			<line
				x1="{winningLineCoords.x1}%"
				y1="{winningLineCoords.y1}%"
				x2="{winningLineCoords.x2}%"
				y2="{winningLineCoords.y2}%"
				stroke="#ffffff"
				stroke-width="4.5"
				stroke-linecap="round"
			/>
		</svg>
	{/if}
</div>
