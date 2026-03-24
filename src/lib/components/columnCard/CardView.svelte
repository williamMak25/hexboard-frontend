<script lang="ts">
	import { viewCard } from '$lib/query/board';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import Icon from '@iconify/svelte';
	import Markdown from '@humanspeak/svelte-markdown';
	import { createCardComment, getCommentByCardId } from '$lib/query/comment';
	import toast from 'svelte-5-french-toast';
	import { browser } from '$app/environment';
	import type { UserProfile } from '$lib/types/user';
	import { getUserList } from '$lib/query/auth';
	import RichTextEditor from '../UI/RichTextEditor.svelte';
	import UploadFile from '../UI/UploadFile.svelte';
	import type { FileType } from '$lib/types/board';

	let { cardId, open = $bindable(false) }: { cardId: string; open: boolean } = $props();

	let user: UserProfile | null = $derived(
		browser ? JSON.parse(localStorage.getItem('user') ?? '') : null
	);

	let userListQuery = createQuery(() => ({
		queryKey: ['user_list', 1],
		queryFn: getUserList
	}));

	let openAssignUser = $state(false);
	let assignedUserIdList: string[] = $derived([]);
	let newAttachment: FileType[] = $state([]);

	$effect(() => {
		if (card && card.assignees.length > 0) {
			assignedUserIdList = [...assignedUserIdList, ...(card.assignees?.map((ite) => ite.id) ?? [])];
		}
	});

	let assginUserOption = $derived(
		userListQuery.data
			? userListQuery.data.items.map((ite) => {
					return {
						name: ite.name,
						id: ite.id,
						avatar: ite.avatarUrl,
						email: ite.email
					};
				})
			: []
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

	let isEdit = $state(true);
	let isDelete = $state(false);
</script>

<div
	class="hide-scrollbar flex max-h-[calc(100vh-100px)] min-w-xl flex-col gap-6 overflow-y-auto rounded-2xl bg-white/90 p-6 shadow-sm"
>
	{#if card}
		<!-- Card Header -->
		<div class="space-y-2">
			{#if isEdit}
				<h3 class="text-sm font-semibold text-gray-800">Title</h3>

				<textarea
					bind:value={card.title}
					class="w-full bg-white min-w-xl rounded-lg border border-neutral-300 p-2 text-neutral-600 ring-0 outline-0"
				></textarea>
			{:else}
				<h2 class="w-full text-xl font-bold text-cyan-700">
					{card.title}
				</h2>
			{/if}

			<!-- <button
					class=" rounded-full p-2 text-neutral-700 hover:bg-neutral-100"
					onclick={() => (open = false)}><Icon icon="entypo:cross" width="24" height="24" /></button
				> -->
			<div class="flex items-center gap-3 py-2">
				<span class="flex items-center gap-2">
					<span class="text-sm font-semibold text-nowrap text-gray-800">Due Date:</span>
					{#if isEdit}
						<input
							bind:value={card.dueDate}
							type="date"
							class="w-full rounded-lg border bg-white border-neutral-300 p-2 text-neutral-600 ring-0 outline-0"
						/>
					{:else}
						<span class="text-sm font-medium text-gray-500">
							{new Date(card.dueDate).toLocaleDateString()}
						</span>
					{/if}
				</span>
				{#if !isEdit}
					<button
						onclick={() => {
							isEdit = !isEdit;
						}}
						class="flex items-center gap-1 text-yellow-600"
						><span class="text-sm font-semibold">Edit</span>
						<Icon icon="iconoir:edit" width="16" height="16" /></button
					>

					<button class="flex items-center gap-1 text-red-600"
						><span class="text-sm font-semibold">Delete</span>
						<Icon icon="streamline-ultimate:delete-bold" width="16" height="16" />
					</button>
				{/if}
			</div>
			<hr class="border-dashed border-cyan-400" />

			<h3 class="text-sm font-semibold text-gray-800">Description</h3>

			<!-- Description -->
			<div class="space-y-2 py-2">
				{#if isEdit}
					<RichTextEditor bind:markdownOutput={card.description} />
				{:else}
					<div
						class="min-h-30 rounded-xl border border-dashed border-neutral-200 bg-gray-50 p-3 text-sm leading-6 text-gray-600"
					>
						<Markdown source={card.description || 'No description added.'} />
					</div>
				{/if}
			</div>

			<h3 class="text-sm font-semibold text-gray-800">Assignees</h3>
			{#if isEdit}
				<div class="relative">
					<button
						type="button"
						onclick={() => (openAssignUser = !openAssignUser)}
						class="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-start text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
					>
						<div class="flex items-center gap-2">
							<Icon icon="formkit:add" width="16" height="16" class="text-blue-400" />
							<span class="text-neutral-600">Add Assign User</span>
						</div>
						<Icon
							icon={openAssignUser ? 'icon-park-outline:up' : 'icon-park-outline:down'}
							width="16"
							height="16"
						/>
					</button>
					{#if openAssignUser}
						<div
							id="assignee"
							class="absolute top-20 z-30 flex w-full flex-col gap-1 rounded-lg border border-gray-300 bg-white py-1 text-sm text-gray-900 shadow-md focus:border-blue-500 focus:ring-blue-500"
						>
							{#each assginUserOption as item, i (i)}
								<button
									onclick={() => {
										if (assignedUserIdList.includes(item.id)) {
											assignedUserIdList = assignedUserIdList.filter((id) => id !== item.id);
										} else {
											assignedUserIdList = [...assignedUserIdList, item.id];
										}
									}}
									type="button"
									class="flex items-center justify-between px-2 py-1 hover:bg-gray-200"
								>
									<div class="flex items-center gap-2">
										{#if item.avatar}
											<img
												src="http://localhost:8000/uploaded-files/image_1BEA2959-98C8-402B-B2AA-F895ABE543A8_1770024267.png"
												class="h-8 w-8 rounded-full border border-gray-100 bg-white"
												alt={item.name}
											/>
										{:else}
											<p
												class="flex h-8 w-8 flex-col items-center justify-center rounded-full border border-gray-200 bg-white p-4 text-sm font-medium text-neutral-500"
											>
												{item.name.split(' ')[0].slice(0, 1)}
											</p>
										{/if}
										<div class="flex flex-col items-start">
											<p class="text-xs font-medium">{item.name}</p>
											<span class="text-[10px] text-neutral-500">{item.email}</span>
										</div>
									</div>
									<input type="checkbox" checked={assignedUserIdList.includes(item.id)} />
								</button>
							{/each}
						</div>
					{/if}
					{#if assignedUserIdList.length}
						<div class="flex items-center gap-2 py-2">
							{#each assignedUserIdList as id, i (i)}
								{@const user = assginUserOption.find((ite) => ite.id === id)}
								<div class="flex items-center rounded-2xl border border-gray-200 bg-white p-1">
									{#if user?.avatar}
										<img
											src="http://localhost:8000/uploaded-files/image_1BEA2959-98C8-402B-B2AA-F895ABE543A8_1770024267.png"
											class="h-8 w-8 rounded-full border border-gray-100 bg-white"
											alt={user?.name}
										/>
									{:else}
										<p
											class="flex h-6 w-6 flex-col items-center justify-center rounded-full border border-gray-400 bg-white p-4 text-sm font-medium text-neutral-500"
										>
											{user?.name.split(' ')[0].slice(0, 1)}
										</p>
									{/if}
									<div class="flex flex-col items-start px-1">
										<p class="text-[10px] font-medium">{user?.name}</p>
										<span class="text-[10px] text-neutral-500">{user?.email}</span>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if card.assignees.length}
				<div class="flex items-center gap-2 py-2">
					{#each card.assignees as asign, i (i)}
						<div class="flex items-center gap-2 rounded-lg bg-white p-1">
							{#if asign.avatarUrl}
								<img
									src="http://localhost:8000/uploaded-files/image_1BEA2959-98C8-402B-B2AA-F895ABE543A8_1770024267.png"
									class="h-8 w-8 rounded-full border border-gray-200 bg-white"
									alt={asign.name}
								/>
							{:else}
								<p
									class="flex h-8 w-8 flex-col items-center justify-center rounded-full border border-gray-200 bg-gray-200 p-4 text-sm font-medium text-neutral-500"
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
			{:else}
				<p class="text-sm font-medium text-gray-500">N/A</p>
			{/if}
		</div>
	{/if}
	<h3 class=" text-sm font-semibold text-gray-800">Attachements</h3>
	<div class="h-full">
		{#if isEdit}
			<UploadFile id="edit-attachement" bind:uploadedFiles={newAttachment} />
		{:else if card && card?.attachements.length > 0}
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
		{:else}
			<p class="text-sm font-medium text-gray-500">No attachements added.</p>
		{/if}
	</div>
	{#if !isEdit}
		<h3 class="text-sm font-semibold text-gray-800">Comments</h3>

		<!-- Comments Section -->
		<div class="rounded-xl border border-neutral-200 bg-gray-50 p-5">
			{#if comments.length > 0}
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
			{:else}
				<p class="text-sm text-neutral-600">No Comment Yet.</p>
			{/if}
		</div>
		<form
			onsubmit={handlePostComment}
			class=" relative flex flex-1 items-center gap-3 border-t border-dashed border-cyan-400 pt-4"
		>
			<textarea
				bind:value={comment}
				placeholder="Write a comment..."
				class="hide-scrollbar w-full resize-none appearance-none rounded-lg border border-gray-200 bg-white p-3 text-sm focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
				rows="1"
			></textarea>

			<button
				type="submit"
				class="absolute right-3 rounded-full p-2 text-cyan-600 transition-colors hover:bg-cyan-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
			>
				<Icon icon="tabler:send-filled" width="18" height="18" />
			</button>
		</form>
	{:else}
		<button
			class="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-bold text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
		>
			<span>Save</span>
			<Icon icon="mingcute:check-2-line" width="24" height="24" />
		</button>
	{/if}
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
</style>
