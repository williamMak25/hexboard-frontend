<script lang="ts">
	import { viewCard } from '$lib/query/board';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import Icon from '@iconify/svelte';
	import Markdown from '@humanspeak/svelte-markdown';
	import { createCardComment, getCommentByCardId } from '$lib/query/comment';
	import toast from 'svelte-5-french-toast';
	import { browser } from '$app/environment';
	import type { UserProfile } from '$lib/types/user';

	let { cardId, open = $bindable(false) }: { cardId: string; open: boolean } = $props();

	let user: UserProfile | null = $derived(
		browser ? JSON.parse(localStorage.getItem('user') ?? '') : null
	);

	let cardDetailQuery = createQuery(() => ({
		queryKey: ['card-detail', cardId],
		queryFn: viewCard
	}));

	let commentsByCardQuery = createQuery(() => ({
		queryKey: ['comments-by-card', cardId],
		queryFn: getCommentByCardId
	}));
	let comment = $state('');
	let creatCommentMutation = createMutation(() => ({
		mutationFn: createCardComment,
		onSuccess: () => {
			toast.success('Comment created successfully');
			commentsByCardQuery.refetch();
		},
		onError: () => {
			toast.error('Failed to create comment');
		}
	}));

	let card = $derived(cardDetailQuery.data ? cardDetailQuery.data : null);

	const handlePostComment = () => {
		if (!user || !card) return;
		let data = {
			userId: user.id,
			cardId: card.id,
			message: comment
		};
		creatCommentMutation.mutate(data);
	};

	let comments = $derived(commentsByCardQuery.data ? commentsByCardQuery.data : []);

	$inspect('comments', commentsByCardQuery.data);
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
				<button
					class="rounded-full p-2 text-neutral-700 hover:bg-neutral-100"
					onclick={() => (open = false)}><Icon icon="entypo:cross" width="20" height="20" /></button
				>
			</div>

			<p class="flex flex-col text-sm font-medium">
				Due Date:
				<span class="text-gray-500">
					{new Date(card.dueDate).toLocaleDateString()}
				</span>
			</p>
			<p class="text-sm font-medium">Assignees:</p>
			{#if card.assignees.length}
				<div class="flex flex-col items-start gap-2">
					<div class="flex items-center gap-2">
						{#each card.assignees as asign, i (i)}
							<div class="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
								{#if asign.avatarUrl}
									<img
										src="http://localhost:8000/uploaded-files/image_1BEA2959-98C8-402B-B2AA-F895ABE543A8_1770024267.png"
										class="h-8 w-8 rounded-full border border-gray-200 bg-white"
										alt={asign.name}
									/>
								{:else}
									<p
										class="flex h-8 w-8 flex-col items-center justify-center rounded-full border border-gray-200 bg-white p-4 text-sm font-medium text-neutral-500"
									>
										{asign.avatarUrl || asign.name.split(' ')[0].slice(0, 1)}
									</p>
								{/if}

								<div class="flex flex-col items-start pr-1">
									<p class="text-xs font-medium">{asign.name}</p>
									<span class="text-[10px] text-neutral-500">{asign.email}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<p class="text-sm font-medium text-gray-500">N/A</p>
			{/if}
		</div>
		<h3 class=" text-lg font-semibold text-gray-800">Description</h3>

		<!-- Description -->
		<div class="space-y-2">
			<div
				class="min-h-30 rounded-xl border border-dashed border-neutral-200 bg-gray-50 p-3 text-sm leading-6 text-gray-600"
			>
				<Markdown source={card.description || 'No description added.'} />
			</div>
		</div>
	{/if}
	<h3 class=" text-lg font-semibold text-gray-800">Attachements</h3>
	<div class="h-full p-1">
		<div
			class="grid {card?.attachements && card?.attachements?.length > 1
				? 'grid-cols-2'
				: 'grid-cols-1'} h-full w-full"
		>
			{#each card?.attachements as att, i (i)}
				<!-- split('.').slice(-1)[0] -->
				{#if ['png', 'jpg', 'jpeg'].includes(att.split('.').slice(-1)[0])}
					<img src={att} alt={att.split('/')[-1]} class="h-auto w-full" />
				{:else}
					<div class="col-span-2 flex w-fit items-center space-x-3 overflow-hidden">
						<span class="text-blue-500">📄</span>
						<a
							href={att}
							target="_blank"
							class="truncate text-sm font-medium hover:text-blue-400 hover:underline hover:underline-offset-2"
							>{att.split('/').slice(-1)[0]}</a
						>
					</div>
					<!-- <iframe src={att} width="100%" height="600px" title={att.split('/')[-1]}></iframe> -->
				{/if}
			{/each}
		</div>
	</div>
	<h3 class=" text-lg font-semibold text-gray-800">Comments</h3>

	<!-- Comments Section -->
	<div class="rounded-xl border border-neutral-200 bg-gray-50 p-5">
		<!-- Comment List -->
		<div class="max-h-75 space-y-4 overflow-y-auto pr-1">
			{#each comments as comment, i (i)}
				<div class="flex gap-3">
					<img
						src={comment.commentUser.avatarUrl ?? 'https://i.pravatar.cc/40'}
						class="h-9 w-9 rounded-full object-cover"
						alt="avatar"
					/>
					<div class="flex flex-1 flex-col gap-2">
						<p class="text-sm font-semibold text-gray-800">{comment.commentUser.name}</p>

						<div
							class="rounded-lg {comment.commentUser.id === user?.id
								? 'bg-blue-200'
								: 'bg-white'} w-fit px-4 py-2 shadow-sm"
						>
							<p class=" text-sm text-gray-700">
								{comment.message}
							</p>
						</div>
						<span class="text-xs text-gray-400">{comment.createdAt.split('T')[0]}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<form
		onsubmit={handlePostComment}
		class=" relative flex flex-1 items-center gap-3 border-t border-dashed border-neutral-200 pt-4"
	>
		<textarea
			bind:value={comment}
			placeholder="Write a comment..."
			class="hide-scrollbar w-full resize-none appearance-none rounded-lg border border-gray-200 bg-white p-3 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
			rows="1"
		></textarea>

		<button
			type="submit"
			class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-2 text-cyan-600 transition-colors hover:bg-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
		>
			<Icon icon="tabler:send-filled" width="18" height="18" />
		</button>
	</form>
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
