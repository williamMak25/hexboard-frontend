<script lang="ts">
	import { viewCard } from '$lib/query/board';
	import { createQuery } from '@tanstack/svelte-query';
	import Icon from '@iconify/svelte';

	let { cardId, open = $bindable(false) }: { cardId: string; open: boolean } = $props();

	let cardDetailQuery = createQuery(() => ({
		queryKey: ['card-detail', cardId],
		queryFn: viewCard
	}));

	let card = $derived(cardDetailQuery.data ? cardDetailQuery.data : null);
</script>

<div
	class="hide-scrollbar flex max-h-[calc(100vh-100px)] min-w-xl flex-col gap-6 overflow-y-auto rounded-2xl bg-white p-6 shadow-sm"
>
	{#if card}
		<!-- Card Header -->
		<div class="space-y-2 bg-white">
			<div class="flex items-start justify-between">
				<h2 class="max-w-[calc(100%-40px)] text-2xl font-bold text-cyan-700">
					{card.title}
				</h2>
				<button class="text-neutral-700 hover:bg-neutral-100 p-2 rounded-full" onclick={() => (open = false)}
					><Icon icon="entypo:cross" width="20" height="20" /></button
				>
			</div>

			<p class="text-sm text-gray-500">
				Due Date:
				<span class="font-medium text-gray-700">
					{new Date(card.dueDate).toLocaleDateString()}
				</span>
			</p>
		</div>

		<!-- Description -->
		<div class="space-y-2">
			<p class="text-sm font-semibold text-gray-700">Description</p>

			<div
				class="min-h-30 leading-6 rounded-xl border border-dashed border-neutral-200 bg-gray-50 p-3 text-sm text-gray-600"
			>
				{card.description || 'No description added.'}
			</div>
		</div>
	{/if}

	<!-- Comments Section -->
	<div class="rounded-xl border border-neutral-200 bg-gray-50 p-5">
		<h3 class="mb-5 text-lg font-semibold text-gray-800">Comments</h3>

		<!-- Comment List -->
		<div class="max-h-75 space-y-4 overflow-y-auto pr-1">
			<!-- Comment -->
			<div class="flex gap-3">
				<img
					src="https://i.pravatar.cc/40"
					class="h-9 w-9 rounded-full object-cover"
					alt="avatar"
				/>

				<div class="flex-1">
					<div class="rounded-lg bg-white px-4 py-2 shadow-sm">
						<div class="flex items-center justify-between">
							<p class="text-sm font-semibold text-gray-800">William</p>
							<span class="text-xs text-gray-400">2 min ago</span>
						</div>

						<p class="mt-1 text-sm text-gray-700">
							We should move this task to the design column after review.
						</p>
					</div>

					<div class="mt-1 ml-1 flex gap-4 text-xs text-gray-400">
						<button class="hover:text-gray-600">Reply</button>
						<button class="hover:text-gray-600">Edit</button>
					</div>
				</div>
			</div>

			<!-- Comment -->
			<div class="flex gap-3">
				<img
					src="https://i.pravatar.cc/41"
					class="h-9 w-9 rounded-full object-cover"
					alt="avatar"
				/>

				<div class="flex-1">
					<div class="rounded-lg bg-white px-4 py-2 shadow-sm">
						<div class="flex items-center justify-between">
							<p class="text-sm font-semibold text-gray-800">John</p>
							<span class="text-xs text-gray-400">10 min ago</span>
						</div>

						<p class="mt-1 text-sm text-gray-700">I'll handle the API integration for this card.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class=" relative flex flex-1 items-center gap-3 border-t border-dashed border-neutral-200">
		<textarea
			placeholder="Write a comment..."
			class="hide-scrollbar w-full resize-none appearance-none rounded-lg border border-gray-200 bg-white p-3 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
			rows="1"
		></textarea>

		<button
			class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-2 text-cyan-600 transition-colors hover:bg-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
		>
			<Icon icon="tabler:send-filled" width="18" height="18" />
		</button>
	</div>
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
