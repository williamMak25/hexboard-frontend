<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		children,
		onclick,
		disabled = false,
		class: className = '',
		icon,
		...restProps
	}: {
		children: Snippet;
		onclick?: () => void;
		disabled?: boolean;
		class?: string;
		icon?: Component;
	} & HTMLButtonAttributes = $props();
</script>

<button
	{onclick}
	{disabled}
	{...restProps}
	class="disabled:text-txt-light-gray w-full bg-white px-4 py-3 text-left text-xs transition-colors duration-150 hover:bg-gray-50 disabled:cursor-not-allowed md:text-sm {className} flex items-center gap-x-2"
>
	{#if icon}
		{@const Icon = icon}
		<Icon class="h-4 w-4" />
	{/if}
	{@render children()}
</button>
