<script lang="ts">
	import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom';
	import type { Snippet } from 'svelte';
	import type { Placement } from '@floating-ui/dom';
	import { blur } from 'svelte/transition';

	let {
		children,
		triggerElement,
		placement = 'bottom-start',
		offsetX = 0,
		offsetY = 0,
		isOpen = $bindable(false),
		show = $bindable(false),
		onToggle,
		closeOnClickOutside = true,
		class: className = ''
	}: {
		children?: Snippet;
		triggerElement: HTMLElement;
		placement?: Placement;
		offsetX?: number;
		offsetY?: number;
		isOpen?: boolean;
		show?: boolean;
		onToggle?: (open: boolean) => void;
		closeOnClickOutside?: boolean;
		class?: string;
	} = $props();

	let floatingElement: HTMLElement | null = $state(null);
	let cleanup: (() => void) | undefined;

	function updatePosition() {
		if (!triggerElement || !floatingElement) return;

		const finalOffsetX = offsetX;
		const finalOffsetY = offsetY;

		computePosition(triggerElement, floatingElement, {
			placement,
			middleware: [
				offset({ mainAxis: finalOffsetY, crossAxis: finalOffsetX }),
				flip(),
				shift({ padding: 8 })
			]
		}).then(({ x, y }) => {
			if (!floatingElement) return;
			Object.assign(floatingElement.style, {
				left: `${x}px`,
				top: `${y}px`
			});
		});
	}

	function toggle() {
		isOpen = !isOpen;
		show = isOpen;
		onToggle?.(isOpen);
	}

	// Sync show prop with isOpen
	$effect(() => {
		isOpen = show;
	});

	function handleClickOutside(event: MouseEvent) {
		if (!closeOnClickOutside || !isOpen) return;

		const target = event.target as Node;
		if (triggerElement?.contains(target) || floatingElement?.contains(target)) {
			return;
		}

		isOpen = false;
		show = false;
		onToggle?.(false);
	}

	function handleMenuItemClick(event: MouseEvent) {
		// Close the menu when clicking on any menu item
		const target = event.target as HTMLElement;

		// Check if the clicked element is a button or contains a button (menu item)
		if (target.tagName === 'BUTTON' || target.closest('button')) {
			isOpen = false;
			show = false;
			onToggle?.(false);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			isOpen = false;
			show = false;
			onToggle?.(false);
		}
	}

	// Setup click handler on the passed trigger element
	$effect(() => {
		if (triggerElement) {
			// Add click handler to the trigger element
			const handleClick = (e: Event) => {
				e.preventDefault();
				e.stopPropagation();
				toggle();
			};

			triggerElement.addEventListener('click', handleClick);

			return () => {
				triggerElement.removeEventListener('click', handleClick);
			};
		}
	});

	$effect(() => {
		if (isOpen && triggerElement && floatingElement) {
			updatePosition();

			cleanup = autoUpdate(triggerElement, floatingElement, updatePosition);

			// Add event listeners
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
		} else {
			cleanup?.();
			cleanup = undefined;

			// Remove event listeners
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		}

		return () => {
			cleanup?.();
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- Floating Dropdown -->
{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		transition:blur={{ duration: 150 }}
		bind:this={floatingElement}
		onclick={handleMenuItemClick}
		class="bg-off-white absolute z-50 min-w-48 rounded-lg border border-gray-200 drop-shadow-md {className} overflow-hidden"
		style="top: 0; left: 0;"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
