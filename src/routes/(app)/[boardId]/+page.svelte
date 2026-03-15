<script lang="ts">
	import { page } from '$app/state';
	import CardView from '$lib/components/columnCard/CardView.svelte';
	import CardForm from '$lib/components/forms/CardForm.svelte';
	import ColumnForm from '$lib/components/forms/ColumnForm.svelte';
	import Modal from '$lib/components/UI/Modal.svelte';
	import { getBoardColums, moveCard, moveColumn } from '$lib/query/board';
	import type { Card, Column } from '$lib/types/board';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	const flipDurationMs = 200;

	let openCreateCardModal = $state(false);
	let openCreateColModal = $state(false);
	let openCardView = $state(false);
	let selectedColumnId = $state<string | null>(null);
	let selectedBoardId = $state<string | null>(null);
	let selectedCard = $state<Card | null>(null);
	let columsQuery = $derived(
		createQuery(() => ({
			queryKey: ['columns', page.params.boardId],
			queryFn: getBoardColums
		}))
	);

	let moveCardMutation = createMutation(() => ({
		mutationFn: moveCard,
		onSuccess: () => {
			columsQuery.refetch();
		}
	}));

	let moveColumnMutation = createMutation(() => ({
		mutationFn: moveColumn,
		onSuccess: () => {
			columsQuery.refetch();
		},
		onError(error) {
			console.error('Error moving column:', error);
		}
	}));
	let columns: Column[] = $state([]);

	$effect(() => {
		if (columsQuery.data) {
			columns = Array.isArray(columsQuery.data) ? columsQuery.data : [];
			
		}
	});
	function handleDndConsiderColumns(e: CustomEvent) {
		columns = e.detail.items;
	}

	function handleDndFinalizeColumns(e: CustomEvent) {
		columns = e.detail.items;
		const info = e.detail.info;
		const targetIndex = columns.findIndex((c) => c.id === info.id);
		const targetCol = columns[targetIndex];
		moveColumnMutation.mutate({
			columnId: targetCol.id,
			data: {
				colPosition: targetIndex,
				boardId: targetCol.boardId
			}
		});
	}

	function handleDndConsiderCards(columnId: string, e: CustomEvent) {
		const colIndex = columns.findIndex((c) => c.id === columnId);
		columns[colIndex].cards = e.detail.items;
		columns = [...columns];
	}

	function handleDndFinalizeCards(columnId: string, e: CustomEvent) {
		const colIndex = columns.findIndex((c) => c.id === columnId);
		columns[colIndex].cards = e.detail.items;
		columns = [...columns];
		const targetIndex = columns[colIndex].cards?.findIndex((c) => c.id === e.detail.info.id);
		// const targetCol = columns[targetIndex];
		const newColId = columns?.find((c) =>
			c.cards.find((ite) => ite.id === e.detail.items[0]?.id)
		)?.id;
		let isSameColumn = e.detail.items.every((ite: any) => ite.colId === columnId);

		if (!e.detail.items.length || targetIndex < 0) return;

		moveCardMutation.mutate({
			cardId: isSameColumn
				? e.detail.items[0]?.id
				: e.detail?.items?.find((ite: any) => ite.colId !== newColId)?.id,
			data: {
				position: targetIndex,
				colId: newColId || columnId
			}
		});
	}

	let keywordColors = $derived([
		{
			keywords: ['urgent', 'important', 'high priority', 'asap', 'bug'],
			color: '#FCA5A5'
		},
		{
			keywords: ['low priority', 'later', 'backlog'],
			color: '#A5B4FC'
		},
		{
			keywords: ['in progress', 'ongoing', 'working on it'],
			color: '#FCD34D'
		},
		{
			keywords: ['completed', 'done', 'finished'],
			color: '#86EFAC'
		},
		{
			keywords: ['blocked', 'stuck', 'needs help'],
			color: '#F87171'
		}
	]);
</script>

<div class="h-[calc(100vh-73px)] p-8">
	<section
		class="custom-scrollbar flex h-full items-start gap-6 overflow-x-auto"
		use:dndzone={{ items: columns, flipDurationMs, type: 'column', dropTargetStyle: {} }}
		onconsider={handleDndConsiderColumns}
		onfinalize={handleDndFinalizeColumns}
	>
		{#each columns as column (column.id)}
			<div
				animate:flip={{ duration: flipDurationMs }}
				class="flex max-h-[calc(100%-2rem)] min-w-[320px] flex-col rounded-xl border border-slate-200 bg-white/50 p-2 shadow-sm transition-shadow hover:shadow-md"
			>
				<div class="flex items-center justify-between p-3">
					<h2 class="text-sm font-bold tracking-wider text-slate-600 uppercase">
						{column.title}
					</h2>
					<span
						class="flex h-4 w-4 items-center justify-center rounded-full bg-red-400 p-1 text-xs font-semibold text-slate-100"
						>{column.cards.length}</span
					>
				</div>
				<hr class="border-dashed border-slate-200" />
				<div
					class="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-3"
					use:dndzone={{ items: column.cards, flipDurationMs, dropTargetStyle: {} }}
					onconsider={(e) => handleDndConsiderCards(column.id, e)}
					onfinalize={(e) => handleDndFinalizeCards(column.id, e)}
				>
					{#if column.cards.length === 0}
						<div
							class="flex h-12 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400"
						>
							No tasks yet
						</div>
					{:else}
						{#each column.cards as item (item.id)}
							<div
								tabindex="0"
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										openCardView = true;
										selectedCard = item;
									}
								}}
								role="button"
								onclick={() => {
									openCardView = true;
									selectedCard = item;
								}}
								animate:flip={{ duration: flipDurationMs }}
								class="group relative flex cursor-grab flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 active:cursor-grabbing"
							>
								{#if item.title}
									<span
										style="color: {keywordColors.find(
											(k) =>
												k.keywords.includes(item.title.toLowerCase()) ||
												k.keywords.includes(column.title.toLowerCase())
										)?.color};"
										class="line-clamp-2 w-fit rounded py-0.5 text-sm font-bold"
									>
										{item.title}
									</span>
								{/if}
								<p class="line-clamp-3 text-xs leading-relaxed font-medium text-slate-500">
									{item.description}
								</p>
							</div>
						{/each}
					{/if}
				</div>

				<button
					onclick={() => {
						openCreateCardModal = true;
						selectedColumnId = column.id;
					}}
					class="mt-2 flex items-center gap-2 rounded-lg p-3 text-sm font-medium text-blue-500 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add Task
				</button>
			</div>
		{/each}

		<button
			onclick={() => {
				openCreateColModal = true;
				if (page.params.boardId) {
					selectedBoardId = page.params.boardId;
				}
			}}
			class="flex min-w-[320px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-400 transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600"
		>
			+ Create new list
		</button>
	</section>
</div>

<Modal bind:open={openCreateCardModal}>
	<div class="flex min-w-lg flex-col gap-6 rounded-2xl bg-white p-6">
		<div>
			<h2 class="text-lg font-semibold">Create New Card</h2>
			<p class="text-sm text-slate-500">Add a new card to the column</p>
		</div>
		{#if selectedColumnId}
			<CardForm columnId={selectedColumnId} bind:open={openCreateCardModal} />
		{/if}
	</div>
</Modal>

<Modal bind:open={openCreateColModal}>
	<div class="flex min-w-lg flex-col gap-4 rounded-2xl bg-white p-4">
		<div>
			<h2 class="text-lg font-semibold">Create New Column</h2>
			<p class="text-sm text-slate-500">Add a new column to the board</p>
		</div>
		{#if selectedBoardId}
			<ColumnForm boardId={selectedBoardId} bind:open={openCreateColModal} />
		{/if}
	</div>
</Modal>

<Modal bind:open={openCardView}>
	{#if selectedCard}
		<CardView cardId={selectedCard?.id} bind:open={openCardView} />
	{/if}
</Modal>

<style>
	:global(.dndzone-ghost) {
		opacity: 0.2;
		transform: scale(0.98);
		filter: grayscale(1);
	}

	/* Subtle scrollbar for cards */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
		height: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 10px;
	}
</style>
