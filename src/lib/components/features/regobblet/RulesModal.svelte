<script lang="ts">
	import Modal from '#lib/components/ui/Modal.svelte';
	import Button from '#lib/components/ui/Button.svelte';

	interface Props {
		isOpen: boolean;
		onclose: () => void;
	}

	let { isOpen, onclose }: Props = $props();

	type Tab = 'core' | 'boards' | 'variants' | 'strategy';
	let activeTab = $state<Tab>('core');
</script>

<Modal {isOpen} title="Regobblet · Official Rules" maxWidth="lg" {onclose}>
	<div class="flex flex-col gap-4 py-1 text-stone-200">
		<!-- Tabs Header -->
		<div
			class="flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-950 p-1 text-xs font-semibold"
		>
			<button
				type="button"
				onclick={() => (activeTab = 'core')}
				class="flex-1 cursor-pointer rounded-lg py-1.5 transition-colors {activeTab === 'core'
					? 'bg-stone-800 text-amber-400'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				Core Rules
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'boards')}
				class="flex-1 cursor-pointer rounded-lg py-1.5 transition-colors {activeTab === 'boards'
					? 'bg-stone-800 text-amber-400'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				Board Sizes
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'variants')}
				class="flex-1 cursor-pointer rounded-lg py-1.5 transition-colors {activeTab === 'variants'
					? 'bg-stone-800 text-amber-400'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				Variants
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'strategy')}
				class="flex-1 cursor-pointer rounded-lg py-1.5 transition-colors {activeTab === 'strategy'
					? 'bg-stone-800 text-amber-400'
					: 'text-stone-400 hover:text-stone-200'}"
			>
				Strategy
			</button>
		</div>

		<!-- Tab Contents -->
		{#if activeTab === 'core'}
			<div class="flex flex-col gap-3 text-xs leading-relaxed">
				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-100">Turn Structure (§2)</h4>
					<p class="text-stone-300">
						On your turn, choose <strong>exactly one</strong> action:
					</p>
					<ul class="mt-1 list-inside list-disc space-y-1 text-stone-400">
						<li>
							<strong>Place:</strong> Take a piece from your reserve and place it on an empty square or
							on top of a strictly smaller piece.
						</li>
						<li>
							<strong>Move:</strong> Pick up one of your visible top pieces on the board and move it to
							another square (empty or strictly smaller).
						</li>
					</ul>
					<p class="mt-2 text-stone-400 italic">
						No passing! If you have any legal action, you must act.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-100">Gobbling & Stacking (§3)</h4>
					<p class="text-stone-300">
						Larger pieces <strong>gobble (cover)</strong> strictly smaller ones. Rank 1 is the smallest
						doll. A Rank 4 piece may cover Ranks 1, 2, or 3, but cannot cover another Rank 4 or higher.
					</p>
					<p class="mt-1 text-stone-400">Covering your own pieces is legal (defensive blocking).</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-100">Reveals & Winning (§4 & §5)</h4>
					<p class="text-stone-300">
						When you move a piece off a square, whatever was underneath is <strong>revealed</strong> and
						becomes the visible top piece again.
					</p>
					<p class="mt-1 font-medium text-amber-300">
						⚠️ Warning: If your move uncovers a line of your opponent's pieces, your opponent wins
						immediately!
					</p>
					<p class="mt-1 text-stone-400">
						First player to line up the required number of top visible pieces in a row, column, or
						diagonal wins immediately.
					</p>
				</div>
			</div>
		{:else if activeTab === 'boards'}
			<div class="flex flex-col gap-3 text-xs leading-relaxed">
				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<div class="mb-1 flex items-center justify-between">
						<h4 class="text-sm font-bold text-amber-400">3×3 Grid · Fast & Tactical</h4>
						<span class="rounded bg-stone-900 px-2 py-0.5 font-mono text-[10px] text-stone-300"
							>3 in a row</span
						>
					</div>
					<p class="text-stone-300">Default: 6 pieces per player (ranks 1–6). 8 winning lines.</p>
					<p class="mt-1 text-stone-400">
						The perfect 10-minute game to learn the core loop: placement, gobbling, and reveals.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<div class="mb-1 flex items-center justify-between">
						<h4 class="text-sm font-bold text-teal-400">4×4 Grid · Medium Positional</h4>
						<span class="rounded bg-stone-900 px-2 py-0.5 font-mono text-[10px] text-stone-300"
							>3 or 4 in a row</span
						>
					</div>
					<p class="text-stone-300">Default: 9 pieces per player (ranks 1–9).</p>
					<p class="mt-1 text-stone-400">
						<strong>3-in-a-row preset (recommended):</strong> 24 winning lines, fast tactical play.
						<br />
						<strong>4-in-a-row preset:</strong> 10 winning lines, highly defensive and positional.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<div class="mb-1 flex items-center justify-between">
						<h4 class="text-sm font-bold text-purple-400">5×5 Grid · Large Reveal Endgame</h4>
						<span class="rounded bg-stone-900 px-2 py-0.5 font-mono text-[10px] text-stone-300"
							>4 in a row (28 lines)</span
						>
					</div>
					<p class="text-stone-300">Balanced Strategic (16 pieces: 2× ranks 1–4, 1× ranks 5–12).</p>
					<p class="mt-1 text-stone-400">
						Reserves run out quickly. The mid-to-endgame is dominated by board movement, memory, and
						tactical uncovers.
					</p>
				</div>
			</div>
		{:else if activeTab === 'variants'}
			<div class="flex flex-col gap-3 text-xs leading-relaxed">
				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-100">No-Reveal-Win Variant</h4>
					<p class="text-stone-400">
						In standard rules, uncovering an opponent's win is legal but loses. With this variant
						enabled, any move that would reveal an opponent's line is treated as an illegal move.
						More forgiving for beginners.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-100">No Moving (Pure Gobbling)</h4>
					<p class="text-stone-400">
						Pieces once placed can never be picked up or moved. The game becomes a pure placement
						and gobbling contest until reserves run out.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-100">Stack Cap</h4>
					<p class="text-stone-400">
						Restricts the maximum number of pieces that can be stacked on a single square (e.g. max
						3 or 4). Prevents endless burying.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-100">Balanced Distributions</h4>
					<p class="text-stone-400">
						Duplicates low ranks (e.g. 2× ranks 1–2 on 3×3, 2× ranks 1–3 on 4×4, 2× ranks 1–4 on
						5×5) to grant cheap tempo moves and reduce hoarding of the biggest dolls.
					</p>
				</div>
			</div>
		{:else if activeTab === 'strategy'}
			<div class="flex flex-col gap-3 text-xs leading-relaxed">
				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-amber-400">1. Don't Waste Top Ranks Early</h4>
					<p class="text-stone-300">
						Your highest rank piece can never be covered. Dropping it on an empty edge square early
						wastes its immense blocking and gobbling power. Save it for contested key squares.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-teal-400">2. Watch What You Cover</h4>
					<p class="text-stone-300">
						Remember what lies buried! Gobbling an opponent's piece hides it, but if you later move
						your piece away, that opponent piece will resurrect.
					</p>
				</div>

				<div class="bg-stone-850 border-stone-750 rounded-xl border p-3">
					<h4 class="mb-1 text-sm font-bold text-stone-200">3. Center Dominance</h4>
					<p class="text-stone-300">
						Center squares participate in horizontal, vertical, and both diagonal lines. Controlling
						the center with a resilient rank gives you multiple offensive fronts.
					</p>
				</div>
			</div>
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="primary" size="md" onclick={onclose}>Got It</Button>
	{/snippet}
</Modal>
