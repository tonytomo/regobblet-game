<script lang="ts">
	import { gameStore } from '#lib/stores/gameStore.svelte.js';

	let isOpen = $state<boolean>(false);
	const history = $derived(gameStore.state.history);
</script>

<div
	class="mx-auto w-full max-w-[500px] overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60 text-xs select-none"
>
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 font-semibold text-stone-300 transition-colors hover:bg-stone-800/50"
	>
		<div class="flex items-center gap-2">
			<span>Move Log</span>
			<span class="py-0.2 rounded-full bg-stone-800 px-1.5 text-[10px] text-stone-400">
				{history.length}
			</span>
		</div>
		<svg
			class="h-4 w-4 transform text-stone-400 transition-transform duration-200 {isOpen
				? 'rotate-180'
				: ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isOpen}
		<div
			class="flex max-h-48 flex-col gap-1.5 overflow-y-auto border-t border-stone-800 bg-stone-950/40 p-3"
		>
			{#if history.length === 0}
				<div class="py-2 text-center text-stone-500 italic">No moves made yet</div>
			{:else}
				{#each history as rec, idx (`${rec.turnNumber}-${idx}`)}
					<div
						class="border-stone-850 flex items-center justify-between rounded-lg border bg-stone-900/40 px-2 py-1 text-[11px]"
					>
						<div class="flex items-center gap-2">
							<span class="w-5 font-mono text-stone-500">{idx + 1}.</span>
							<span class="font-bold {rec.player === 1 ? 'text-amber-400' : 'text-teal-400'}">
								{rec.notation}
							</span>
						</div>
						<span class="text-[10px] text-stone-500">
							{rec.action.type}
						</span>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>
