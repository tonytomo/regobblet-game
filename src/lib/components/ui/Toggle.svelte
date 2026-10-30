<script lang="ts">
	interface Props {
		checked: boolean;
		label: string;
		description?: string;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let { checked = false, label, description, disabled = false, onchange }: Props = $props();

	function handleToggle() {
		if (disabled) return;
		const next = !checked;
		onchange?.(next);
	}
</script>

<div class="flex items-center justify-between gap-4 py-2">
	<div class="flex flex-col">
		<span class="text-sm font-medium text-stone-200 {disabled ? 'opacity-50' : ''}">{label}</span>
		{#if description}
			<span class="text-xs text-stone-400 {disabled ? 'opacity-50' : ''}">{description}</span>
		{/if}
	</div>
	<button
		type="button"
		role="switch"
		aria-label={label}
		aria-checked={checked}
		{disabled}
		onclick={handleToggle}
		class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900 disabled:cursor-not-allowed disabled:opacity-40 {checked
			? 'bg-amber-600'
			: 'bg-stone-700'}"
	>
		<span
			class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out {checked
				? 'translate-x-5'
				: 'translate-x-0'}"
		></span>
	</button>
</div>
