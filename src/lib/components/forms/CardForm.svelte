<script lang="ts">
	import { browser } from '$app/environment';
	import { createCard } from '$lib/query/board';
	import type { CreateCard, FileType } from '$lib/types/board';
	import { PriorityEnum } from '$lib/types/board';
	import type { UserProfile } from '$lib/types/user';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import UploadFile from '../UI/UploadFile.svelte';
	import RichTextEditor from '../UI/RichTextEditor.svelte';
	import { getUserList } from '$lib/query/auth';
	import Icon from '@iconify/svelte';

	let { columnId, open = $bindable(false) }: { columnId: string; open: boolean } = $props();

	const client = useQueryClient();

	let user: UserProfile = $derived(browser ? JSON.parse(localStorage.getItem('user') ?? '') : null);
	let openAssignUser = $state(false);
	let userListQuery = createQuery(() => ({
		queryKey: ['user_list', 1],
		queryFn: getUserList
	}));

	let assignedUserIdList: string[] = $state([]);

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

	let title = $state('');
	let description = $state('');
	let dueDate = $state('');
	let priority = $state(PriorityEnum.LOW);
	let attachements: FileType[] = $state([]);
	let createCardMutation = createMutation(() => ({
		mutationFn: createCard,
		onSuccess: () => {
			title = '';
			description = '';
			dueDate = '';
			open = false;
			client.invalidateQueries({ queryKey: ['columns'] });
		},
		onError(error) {
			console.error('Error creating card:', error);
		}
	}));

	function handleSubmit() {
		let data: CreateCard = {
			title,
			description,
			colId: columnId,
			dueDate: dueDate + 'T00:00:00Z',
			priority: priority,
			assigneeIds: assignedUserIdList,
			attachements: attachements.flatMap((ite) => {
				return ite.filePath;
			}),
			reporterId: user.id
		};
		createCardMutation.mutate(data);
	}
	$inspect(attachements);
</script>

<form onsubmit={handleSubmit} class="scroll-hide flex max-h-160 flex-col gap-4 overflow-auto">
	<div class="grid grid-cols-2 gap-4">
		<div class="">
			<label for="title" class="mb-2 block font-medium text-gray-900">Title</label>
			<input
				type="text"
				id="title"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
				placeholder="Card title"
				bind:value={title}
			/>
		</div>
		<div class="">
			<label for="priority" class="mb-2 block font-medium text-gray-900">Priority</label>
			<select
				id="priority"
				class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
				bind:value={priority}
			>
				{#each Object.entries(PriorityEnum) as [key, value], i (i)}
					<option {value}>{key}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="">
		<label for="due-date" class="mb-2 block font-medium text-gray-900">Due Date</label>
		<input
			type="date"
			id="due-date"
			class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
			placeholder="Card title"
			bind:value={dueDate}
		/>
	</div>
	<div class="relative">
		<label for="assignee" class="mb-2 block font-medium text-gray-900">Assignees</label>
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
				class="absolute top-20 z-30 flex w-full flex-col gap-1 rounded-lg border border-gray-300 bg-gray-50 py-1 text-sm text-gray-900 shadow-md focus:border-blue-500 focus:ring-blue-500"
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
		{#if assignedUserIdList}
			<div class="flex items-center gap-2 py-2">
				{#each assignedUserIdList as id, i (i)}
					{@const user = assginUserOption.find((ite) => ite.id === id)}
					<div class="flex items-center rounded-2xl border border-gray-200 bg-gray-100 p-1">
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
	<div class="">
		<label for="description" class="mb-2 block font-medium text-gray-900">Description</label>
		<RichTextEditor bind:markdownOutput={description} />
	</div>

	<div class="">
		<label for="attachement" class="mb-2 block font-medium text-gray-900">Attachements</label>

		<UploadFile id="attachement" bind:uploadedFiles={attachements} />
	</div>

	<div class="flex items-center gap-4">
		<button
			type="button"
			class="mr-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300 focus:outline-none"
			onclick={() => (open = false)}
		>
			Cancel
		</button>
		<button
			type="submit"
			class="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-center font-medium text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
		>
			Create Card
		</button>
	</div>
</form>

<style>
	.scroll-hide::-webkit-scrollbar {
		display: none;
	}
</style>
