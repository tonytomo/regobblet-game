<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'neutral' | 'player1' | 'player2' | 'warning' | 'success';
		size?: 'sm' | 'md';
		class?: string;
		children?: Snippet;
	}

	let { variant = 'neutral', size = 'md', class: className = '', children }: Props = $props();

	const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none';

	const sizeStyles = {
		sm: 'px-2 py-0.5 text-[10px] gap-1',
		md: 'px-2.5 py-1 text-xs gap-1.5'
	};

	const variantStyles = {
		neutral: 'bg-stone-800 text-stone-300 border border-stone-700/60',
		player1:
			'bg-amber-950/80 text-amber-300 border border-amber-600/40 shadow-xs shadow-amber-900/30',
		player2: 'bg-teal-950/80 text-teal-300 border border-teal-600/40 shadow-xs shadow-teal-900/30',
		warning: 'bg-amber-950/60 text-amber-400 border border-amber-600/30',
		success: 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/30'
	};
</script>

<span class="{baseStyles} {sizeStyles[size]} {variantStyles[variant]} {className}">
	{#if children}
		{@render children()}
	{/if}
</span>
