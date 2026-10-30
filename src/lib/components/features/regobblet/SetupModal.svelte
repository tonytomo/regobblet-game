<script lang="ts">
	import Modal from '#lib/components/ui/Modal.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Toggle from '#lib/components/ui/Toggle.svelte';
	import type { BoardDimension } from '#lib/types/game.js';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';
	import { createConfigFromPreset, PRESETS } from '#lib/utils/presets.js';

	interface Props {
		isOpen: boolean;
		onclose: () => void;
	}

	let { isOpen, onclose }: Props = $props();

	let selectedSize = $state<BoardDimension>(gameStore.state.config.size);
	let selectedPresetId = $state<string>(
		PRESETS.find((p) => p.boardSize === gameStore.state.config.size)?.id ?? PRESETS[0].id
	);
	let noRevealWin = $state<boolean>(gameStore.state.config.variants.noRevealWin);
	let noMoving = $state<boolean>(gameStore.state.config.variants.noMoving);
	let enableStackCap = $state<boolean>(gameStore.state.config.variants.stackCap !== undefined);
	let stackCapValue = $state<number>(gameStore.state.config.variants.stackCap ?? 4);

	const availablePresets = $derived(PRESETS.filter((p) => p.boardSize === selectedSize));

	function handleSizeChange(size: BoardDimension) {
		selectedSize = size;
		const matching = PRESETS.find((p) => p.boardSize === size);
		if (matching) {
			selectedPresetId = matching.id;
		}
	}

	function handleStartGame() {
		const preset = PRESETS.find((p) => p.id === selectedPresetId) ?? availablePresets[0];
		const config = createConfigFromPreset(preset, {
			noRevealWin,
			noMoving,
			stackCap: enableStackCap ? stackCapValue : undefined
		});

		gameStore.startNewGame(config);
		onclose();
	}
</script>

<Modal {isOpen} title="Configure Board & Game Rules" maxWidth="md" {onclose}>
	<div class="flex flex-col gap-5 py-1">
		<!-- 1. Board Dimension Selection -->
		<div class="flex flex-col gap-2">
			<span class="text-xs font-bold tracking-wider text-stone-400 uppercase"> Board Size </span>
			<div class="grid grid-cols-3 gap-2">
				{#each [3, 4, 5] as size (size)}
					<button
						type="button"
						onclick={() => handleSizeChange(size as BoardDimension)}
						class="flex cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all
							{selectedSize === size
							? 'border-amber-500 bg-amber-600/20 text-amber-200 ring-2 ring-amber-500/30'
							: 'bg-stone-850 border-stone-750 text-stone-300 hover:bg-stone-800'}"
					>
						<span class="text-base font-extrabold">{size}×{size}</span>
						<span class="text-[10px] text-stone-400">
							{size === 3 ? 'Fast' : size === 4 ? 'Tactical' : 'Deep'}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- 2. Presets for Selected Board -->
		<div class="flex flex-col gap-2">
			<span class="text-xs font-bold tracking-wider text-stone-400 uppercase">
				Recommended Presets
			</span>
			<div class="flex flex-col gap-2">
				{#each availablePresets as preset (preset.id)}
					<button
						type="button"
						onclick={() => (selectedPresetId = preset.id)}
						class="flex cursor-pointer flex-col rounded-xl border p-3 text-left transition-all
							{selectedPresetId === preset.id
							? 'border-amber-500/70 bg-amber-600/15 text-stone-100 ring-1 ring-amber-500/40'
							: 'bg-stone-850 border-stone-750/70 text-stone-300 hover:bg-stone-800'}"
					>
						<div class="flex items-center justify-between">
							<span class="text-sm font-bold text-stone-100">{preset.name}</span>
							<span
								class="rounded-full border border-stone-700 bg-stone-900 px-2 py-0.5 font-mono text-[11px] text-stone-300"
							>
								Win: {preset.winLength} in a row
							</span>
						</div>
						<p class="mt-1 text-xs text-stone-400">{preset.description}</p>
						{#if preset.notes}
							<p class="mt-1 font-mono text-[10px] text-amber-400/80">{preset.notes}</p>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- 3. Universal Rule Variants -->
		<div class="flex flex-col gap-1 border-t border-stone-800 pt-3">
			<span class="mb-1 text-xs font-bold tracking-wider text-stone-400 uppercase">
				Rule Variants
			</span>

			<Toggle
				checked={noRevealWin}
				label="No-Reveal-Win Variant (§8)"
				description="Moving a piece that exposes an opponent's winning line is an illegal move."
				onchange={(v) => (noRevealWin = v)}
			/>

			<Toggle
				checked={noMoving}
				label="No Moving Variant (§8)"
				description="Placement only; pieces on the board cannot be moved (pure gobbling)."
				onchange={(v) => (noMoving = v)}
			/>

			<Toggle
				checked={enableStackCap}
				label="Stack Cap Variant (§8)"
				description="Limits maximum stack depth on any square."
				onchange={(v) => (enableStackCap = v)}
			/>

			{#if enableStackCap}
				<div
					class="mt-1 flex items-center justify-between rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs"
				>
					<span class="font-medium text-stone-300">Max Stack Height:</span>
					<div class="flex items-center gap-2">
						{#each [3, 4, 5] as cap (cap)}
							<button
								type="button"
								onclick={() => (stackCapValue = cap)}
								class="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition-colors
									{stackCapValue === cap
									? 'bg-amber-600 text-white'
									: 'bg-stone-800 text-stone-400 hover:text-stone-200'}"
							>
								{cap}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#snippet footer()}
		<Button variant="secondary" size="md" onclick={onclose}>Cancel</Button>
		<Button variant="primary" size="md" onclick={handleStartGame}>Apply & Start New Game</Button>
	{/snippet}
</Modal>
