<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		title?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		class: className = '',
		title,
		onclick,
		children
	}: Props = $props();

	const baseStyles =
		'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

	const sizeStyles = {
		sm: 'px-2.5 py-1.5 text-xs gap-1.5',
		md: 'px-3.5 py-2 text-sm gap-2',
		lg: 'px-5 py-2.5 text-base gap-2.5'
	};

	const variantStyles = {
		primary:
			'bg-amber-600 text-white hover:bg-amber-500 shadow-sm shadow-amber-900/20 focus-visible:ring-amber-500 border border-amber-500/30',
		secondary:
			'bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white border border-stone-700/60 shadow-sm focus-visible:ring-stone-500',
		ghost: 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 focus-visible:ring-stone-600',
		danger:
			'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-950/20 focus-visible:ring-rose-500 border border-rose-500/30',
		accent:
			'bg-teal-600 text-white hover:bg-teal-500 shadow-sm shadow-teal-900/20 focus-visible:ring-teal-500 border border-teal-500/30'
	};
</script>

<button
	{type}
	{disabled}
	{title}
	class="{baseStyles} {sizeStyles[size]} {variantStyles[variant]} {className}"
	{onclick}
>
	{#if children}
		{@render children()}
	{/if}
</button>
