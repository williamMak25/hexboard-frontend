<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		mode = 'popup', // 'popup' | 'left' | 'right'
		children,
		closeOnBackdrop = true,
		lockScroll = true,
		class: className = '',
		onClose
	}: {
		open?: boolean;
		mode?: 'popup' | 'left' | 'right';
		children: Snippet;
		closeOnBackdrop?: boolean;
		lockScroll?: boolean;
		class?: string;
		onClose?: () => void;
	} = $props();

	let backdropEl: HTMLElement | null = $state(null);
	let contentEl: HTMLElement | null = $state(null);
	let previouslyFocused: Element | null = null;

	function closeModal() {
		open = false;
		onClose?.();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (!closeOnBackdrop) return;
		closeModal();
	}

	function getFocusableElements(container: HTMLElement): HTMLElement[] {
		const selectors = [
			'a[href]',
			'area[href]',
			'button:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'iframe',
			'object',
			'embed',
			'[tabindex]:not([tabindex="-1"])',
			'[contenteditable]'
		];
		return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
			(el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
		);
	}

	function trapTabKey(e: KeyboardEvent) {
		if (!contentEl) return;
		const focusable = getFocusableElements(contentEl);
		if (focusable.length === 0) {
			e.preventDefault();
			return;
		}
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;
		if (e.shiftKey) {
			if (active === first || !contentEl.contains(active)) {
				last.focus();
				e.preventDefault();
			}
		} else {
			if (active === last || !contentEl.contains(active)) {
				first.focus();
				e.preventDefault();
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			closeModal();
			return;
		}

		if (e.key === 'Tab') {
			trapTabKey(e);
		}
	}

	$effect(() => {
		if (open) {
			previouslyFocused = document.activeElement;
			if (lockScroll) {
				document.documentElement.style.overflow = 'hidden';
			}
			document.addEventListener('keydown', handleKeydown, true);
		} else {
			document.removeEventListener('keydown', handleKeydown, true);
			if (lockScroll) {
				document.documentElement.style.overflow = '';
			}
			if (previouslyFocused instanceof HTMLElement) {
				previouslyFocused.focus();
			}
		}

		return () => {
			document.removeEventListener('keydown', handleKeydown, true);
		};
	});
</script>

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={backdropEl}
		class="fixed inset-0 z-70 bg-black/60 {className}"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 150 }}
	></div>
{/if}

{#if open && mode === 'popup'}
	<div
		bind:this={contentEl}
		class="fixed top-1/2 left-1/2 z-80 -translate-x-1/2 -translate-y-1/2"
		transition:scale={{ duration: 150 }}
	>
		{@render children()}
	</div>
{/if}

{#if open && mode === 'left'}
	<div
		bind:this={contentEl}
		class="fixed top-0 bottom-0 left-0 z-80"
		transition:fly={{ duration: 150, x: -100 }}
	>
		{@render children()}
	</div>
{/if}

{#if open && mode === 'right'}
	<div
		bind:this={contentEl}
		class="fixed top-0 right-0 bottom-0 z-80"
		transition:fly={{ duration: 150, x: 100 }}
	>
		{@render children()}
	</div>
{/if}
