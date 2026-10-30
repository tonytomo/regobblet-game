<script lang="ts">
	import Modal from '#lib/components/ui/Modal.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import PieceComponent from './Piece.svelte';

	const inspected = $derived(gameStore.inspectedStack);
	const isOpen = $derived(inspected !== null);

	const coordLabel = $derived.by(() => {
		if (!inspected) return '';
		const col = String.fromCharCode(65 + inspected.col);
		const row = inspected.row + 1;
		return `${col}${row}`;
	});
</script>

<Modal
	{isOpen}
	title="Stack Inspection · Square {coordLabel}"
	maxWidth="sm"
	onclose={() => gameStore.closeInspect()}
>
	{#if inspected}
		<div class="flex flex-col gap-3 py-1">
			<p class="text-xs text-stone-400">
				Displaying cross-section of pieces in square {coordLabel} from bottom to top. Only the top piece
				is currently visible and active.
			</p>

			<div
				class="flex flex-col-reverse gap-2 rounded-xl border border-stone-800 bg-stone-950/70 p-3"
			>
				{#each inspected.stack as piece, idx (`${piece.id}-${idx}`)}
					{@const isTop = idx === inspected.stack.length - 1}
					<div
						class="flex items-center justify-between rounded-xl border p-2 transition-colors
							{isTop ? 'border-stone-600 bg-stone-800/80' : 'border-stone-800/80 bg-stone-900/60'}"
					>
						<div class="flex items-center gap-3">
							<div class="h-9 w-9">
								<PieceComponent {piece} maxRank={12} />
							</div>
							<div class="flex flex-col">
								<span
									class="text-xs font-bold {piece.owner === 1 ? 'text-amber-400' : 'text-teal-400'}"
								>
									Player {piece.owner} · Rank {piece.rank}
								</span>
								<span class="text-[10px] text-stone-400">
									Level {idx + 1} of {inspected.stack.length}
								</span>
							</div>
						</div>

						{#if isTop}
							<span
								class="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-amber-300 uppercase"
							>
								Top Visible
							</span>
						{:else}
							<span class="text-[10px] font-medium text-stone-500"> Covered </span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#snippet footer()}
		<Button variant="secondary" size="sm" onclick={() => gameStore.closeInspect()}>Close</Button>
	{/snippet}
</Modal>
