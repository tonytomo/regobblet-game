<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	class="flex min-h-screen flex-col bg-stone-950 font-sans text-stone-100 selection:bg-amber-600/30 selection:text-amber-200"
>
	<main class="flex w-full grow flex-col items-center justify-start px-2 py-2 sm:px-4 sm:py-6">
		<div class="mx-auto flex w-full max-w-5xl flex-col gap-4">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</main>
	<footer
		class="border-stone-850 w-full border-t py-4 text-center text-xs text-stone-400 select-none"
	>
		<p>Regobblet · Matryoshka Nested Tic-Tac-Toe · 3×3, 4×4 & 5×5</p>
	</footer>
</div>
