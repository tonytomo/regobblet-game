<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		isOpen: boolean;
		title?: string;
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
		onclose?: () => void;
		children?: Snippet;
		footer?: Snippet;
	}

	let { isOpen = false, title = '', maxWidth = 'md', onclose, children, footer }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen && onclose) {
			onclose();
		}
	}

	const maxWidthStyles = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-2xl'
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs duration-200 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop click target -->
		<button
			type="button"
			class="fixed inset-0 -z-10 h-full w-full cursor-default bg-transparent"
			onclick={onclose}
			aria-label="Close dialog"
			tabindex="-1"
		></button>

		<div
			class="relative w-full {maxWidthStyles[
				maxWidth
			]} border-stone-750 flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border bg-stone-900 text-stone-100 shadow-2xl"
		>
			{#if title}
				<div class="flex items-center justify-between border-b border-stone-800 px-5 py-4">
					<h3 class="text-base font-bold tracking-tight text-stone-100 sm:text-lg">
						{title}
					</h3>
					<button
						type="button"
						onclick={onclose}
						class="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
						aria-label="Close modal"
					>
						<svg
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M6 6l8 8m0-8l-8 8" stroke-linecap="round" />
						</svg>
					</button>
				</div>
			{/if}

			<div class="grow overflow-y-auto px-5 py-4">
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if footer}
				<div
					class="flex items-center justify-end gap-2.5 border-t border-stone-800 bg-stone-900/90 px-5 py-3.5"
				>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
