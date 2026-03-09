<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';

	const flipDurationMs = 200;

	let columns = [
		{
			id: '1',
			title: 'To Do',
			items: [
				{ id: '10', text: 'Define API Schema', tag: 'Backend', color: 'bg-blue-100 text-blue-700' },
				{
					id: '11',
					text: 'Setup Litestar Auth',
					tag: 'Security',
					color: 'bg-purple-100 text-purple-700'
				}
			]
		},
		{
			id: '2',
			title: 'In Progress',
			items: [
				{
					id: '12',
					text: 'Refactor Repository Logic',
					tag: 'Refactor',
					color: 'bg-orange-100 text-orange-700'
				}
			]
		},
		{ id: '3', title: 'Done', items: [] }
	];

	function handleDndConsiderColumns(e: CustomEvent) {
		columns = e.detail.items;
	}
	function handleDndFinalizeColumns(e: CustomEvent) {
		columns = e.detail.items;
	}

	function handleDndConsiderCards(columnId: string, e: CustomEvent) {
		const colIndex = columns.findIndex((c) => c.id === columnId);
		columns[colIndex].items = e.detail.items;
		columns = [...columns];
	}
	function handleDndFinalizeCards(columnId: string, e: CustomEvent) {
		const colIndex = columns.findIndex((c) => c.id === columnId);
		columns[colIndex].items = e.detail.items;
		columns = [...columns];
	}
</script>

<main class="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
	<header class="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
		<div class="flex items-center gap-4">
			<h1 class="text-xl font-semibold tracking-tight">Development Board</h1>
			<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
				>v1.0.4</span
			>
		</div>
		<button
			class="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95"
		>
			Share Board
		</button>
	</header>

	<div class="h-[calc(100vh-73px)] overflow-x-auto p-8">
		<section
			class="flex h-full items-start gap-6"
			use:dndzone={{ items: columns, flipDurationMs, type: 'column', dropTargetStyle: {} }}
			on:consider={handleDndConsiderColumns}
			on:finalize={handleDndFinalizeColumns}
		>
			{#each columns as column (column.id)}
				<div
					animate:flip={{ duration: flipDurationMs }}
					class="flex max-h-[calc(100%-2rem)] w-[320px] flex-col rounded-xl border border-slate-200 bg-slate-100/50 p-2 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="flex items-center justify-between p-3">
						<h2 class="text-sm font-bold tracking-wider text-slate-600 uppercase">
							{column.title}
						</h2>
						<span class="text-xs font-semibold text-slate-400">{column.items.length}</span>
					</div>

					<div
						class="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-2"
						use:dndzone={{ items: column.items, flipDurationMs, dropTargetStyle: {} }}
						on:consider={(e) => handleDndConsiderCards(column.id, e)}
						on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
					>
						{#each column.items as item (item.id)}
							<div
								animate:flip={{ duration: flipDurationMs }}
								class="group relative flex cursor-grab flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 active:cursor-grabbing"
							>
								{#if item.tag}
									<span
										class="w-fit rounded px-2 py-0.5 text-[10px] font-bold uppercase {item.color}"
									>
										{item.tag}
									</span>
								{/if}
								<p class="text-sm leading-relaxed font-medium text-slate-700">{item.text}</p>
							</div>
						{/each}
					</div>

					<button
						class="mt-2 flex items-center gap-2 rounded-lg p-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-700"
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
				class="flex min-w-[320px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-400 transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600"
			>
				+ Create new list
			</button>
		</section>
	</div>
</main>

<style>
	:global(.dndzone-ghost) {
		opacity: 0.2;
		transform: scale(0.98);
		filter: grayscale(1);
	}

	/* Subtle scrollbar for cards */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #e2e8f0;
		border-radius: 10px;
	}
</style>
