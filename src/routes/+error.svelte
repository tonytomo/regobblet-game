<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/ui/Button.svelte';
</script>

<div class="flex min-h-screen items-center justify-center bg-stone-950 p-4 text-stone-100">
	<div
		class="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-6 text-center"
	>
		<div
			class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-xl font-bold text-rose-400"
		>
			{page.status}
		</div>
		<h1 class="text-xl font-bold text-stone-100">Something went wrong</h1>
		<p class="text-sm text-stone-400">{page.error?.message || 'An unexpected error occurred.'}</p>
		<Button variant="primary" size="md" onclick={() => (window.location.href = '/')}>
			Return to Game
		</Button>
	</div>
</div>
