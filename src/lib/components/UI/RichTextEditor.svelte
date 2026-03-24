<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	import TurndownService from 'turndown';
	import { gfm } from 'turndown-plugin-gfm';
	import { marked } from 'marked';

	let { markdownOutput = $bindable('') }: { markdownOutput: string } = $props();

	const turndownService = new TurndownService({
		headingStyle: 'atx',
		hr: '---',
		bullet: '*',
		codeBlockStyle: 'fenced'
	});

	turndownService.use(gfm);

	let content = $state(marked.parse(markdownOutput || ''));
	let element: HTMLDivElement | null = $state(null);
	let editorState: { editor: null | Editor } = $state({ editor: null });

	let htmlInput = $derived(content);

	onMount(() => {
		if (element) {
			editorState.editor = new Editor({
				element: element,
				extensions: [StarterKit],
				content: content,
				onUpdate: ({ editor }) => {
					// This updates your Svelte state whenever the user types

					const html = editor.getHTML();

					content = html;
					markdownOutput = turndownService.turndown(html);
				},
				onTransaction: () => {
					editorState = { editor: editorState.editor };
				}
			});
		}
	});

	onDestroy(() => {
		editorState.editor?.destroy();
	});

	// Helper to run commands concisely
	const exec = (command: any) => {
		if (editorState.editor) {
			command(editorState.editor.chain().focus()).run();
		}
	};
	$inspect(markdownOutput);
</script>

<div class="editor-container">
	{#if editorState.editor}
		<div class="toolbar">
			<button
				type="button"
				onclick={() => exec((q) => q.toggleBold())}
				class:active={editorState.editor.isActive('bold')}><b>B</b></button
			>
			<button
				type="button"
				onclick={() => exec((q) => q.toggleItalic())}
				class:active={editorState.editor.isActive('italic')}><i>I</i></button
			>
			<button
				type="button"
				onclick={() => exec((q) => q.toggleStrike())}
				class:active={editorState.editor.isActive('strike')}>S</button
			>

			<div class="divider"></div>

			<button
				type="button"
				onclick={() => exec((q) => q.toggleHeading({ level: 1 }))}
				class:active={editorState.editor.isActive('heading', { level: 1 })}>H1</button
			>
			<button
				type="button"
				onclick={() => exec((q) => q.toggleHeading({ level: 2 }))}
				class:active={editorState.editor.isActive('heading', { level: 2 })}>H2</button
			>

			<div class="divider"></div>

			<button
				type="button"
				onclick={() => exec((q) => q.toggleBulletList())}
				class:active={editorState.editor.isActive('bulletList')}>• List</button
			>
			<button
				type="button"
				onclick={() => exec((q) => q.toggleOrderedList())}
				class:active={editorState.editor.isActive('orderedList')}>1. List</button
			>

			<div class="divider"></div>

			<button type="button" onclick={() => exec((q) => q.undo())}>↶</button>
			<button type="button" onclick={() => exec((q) => q.redo())}>↷</button>
		</div>
	{/if}

	<div class="editor-content" bind:this={element}></div>
</div>

<style>
	.editor-container {
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		background: white;
		max-width: 800px;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 8px;
		background: #f9f9f9;
		border-bottom: 1px solid #ddd;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.divider {
		width: 1px;
		background: #ddd;
		margin: 0 4px;
	}

	button {
		padding: 6px 12px;
		border: 1px solid transparent;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}

	button:hover {
		background: #eee;
	}

	button.active {
		background: #e0e7ff;
		color: #4338ca;
		border-color: #c7d2fe;
	}

	/* Target the Tiptap editor instance specifically */
	:global(.tiptap) {
		padding: 1.5rem;
		min-height: 200px;
		outline: none;
	}

	:global(.tiptap p) {
		margin: 0.5em 0;
	}
	:global(.tiptap li) {
		list-style-type: disc;
	}
	:global(.tiptap h1, .tiptap h2) {
		margin-top: 1em;
	}
	:global(.tiptap ul, .tiptap ol) {
		padding-left: 1.5rem;
	}
</style>
