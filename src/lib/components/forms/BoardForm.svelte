<script lang="ts">
	import { getUserList } from '$lib/query/auth';
	import { createBoard, updateBoard } from '$lib/query/board';
	import type { Board } from '$lib/types/board';
	import type { UserProfile } from '$lib/types/user';
	import Icon from '@iconify/svelte';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import toast from 'svelte-5-french-toast';

	let {
		open = $bindable(false),
		user = null,
		board = null
	}: { open: boolean; user?: UserProfile | null; board?: Board | null } = $props();

	let client = useQueryClient();
	let title = $derived(board?.title || '');
	let ownerId = $derived(board?.ownerId || user?.id);
	let bgColor = $derived(board?.bgColor || 'white');
	let openAddMember = $state(false);
	let memberIds: string[] = $derived(
		board?.members.length ? board.members.map((ite) => ite.id) : []
	);

	const presets = [
		{ name: 'Default', value: 'white' },
		{ name: 'Silver Mist', value: '#CAD2C5	' },
		{ name: 'Soft Sky', value: '#A8DADC' },
		{ name: 'Muted Sand', value: '#F1E3D3' },
		{ name: 'Pale Lavender', value: '#E2E2F0' }
	];
	let userListQuery = createQuery(() => ({
		queryKey: ['user_list', 1],
		queryFn: getUserList
	}));

	let memberOption = $derived(
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

	let createBoardMutation = createMutation(() => ({
		mutationFn: createBoard,
		onSuccess: () => {
			toast.success('Board created successfully');
			client.invalidateQueries({ queryKey: ['boards'] });
			open = false;
			title = '';
			ownerId = '';
			bgColor = '';
		},
		onError: () => {
			toast.error('Failed to create board');
		}
	}));

	let updateBoardMutation = createMutation(() => ({
		mutationFn: updateBoard,
		onSuccess: () => {
			toast.success('Board Updated successfully');
			client.invalidateQueries({ queryKey: ['boards'] });
			open = false;
			title = '';
			ownerId = '';
			bgColor = '';
		},
		onError: () => {
			toast.error('Failed to Update board');
		}
	}));

	let handleCreateBoard = async () => {
		let data = {
			title,
			ownerId: ownerId || '',
			bgColor,
			memberIds
		};
		if (board) {
			updateBoardMutation.mutate({ boarId: board.id, data: data });
		} else {
			createBoardMutation.mutate(data);
		}
	};
</script>

<div class="flex min-w-lg flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-medium">{board ? 'Edit' : 'Create New'} Board</h2>
		<button
			type="button"
			onclick={() => {
				board = null;
				open = false;
			}}>Close</button
		>
	</div>
	<form class="flex flex-col gap-4" onsubmit={handleCreateBoard}>
		<input
			type="text"
			bind:value={title}
			placeholder="Board Title"
			class="w-full rounded-lg border-2 border-neutral-200 px-4 py-3 transition-colors focus:border-blue-500 focus:outline-none"
			required
		/>
		<div class="relative">
			<label for="assignee" class="mb-2 block font-medium text-gray-900">Members</label>
			<button
				type="button"
				onclick={() => (openAddMember = !openAddMember)}
				class="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-start text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
			>
				<div class="flex items-center gap-2">
					<Icon icon="formkit:add" width="16" height="16" class="text-blue-400" />
					<span class="text-neutral-600">Add Member</span>
				</div>
				<Icon
					icon={openAddMember ? 'icon-park-outline:up' : 'icon-park-outline:down'}
					width="16"
					height="16"
				/>
			</button>
			{#if openAddMember}
				<div
					id="assignee"
					class="absolute top-20 z-30 flex w-full flex-col gap-1 rounded-lg border border-gray-300 bg-gray-50 py-1 text-sm text-gray-900 shadow-md focus:border-blue-500 focus:ring-blue-500"
				>
					{#each memberOption as item, i (i)}
						<button
							onclick={() => {
								if (memberIds.includes(item.id)) {
									memberIds = memberIds.filter((id) => id !== item.id);
								} else {
									memberIds = [...memberIds, item.id];
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
							<input type="checkbox" checked={memberIds.includes(item.id)} />
						</button>
					{/each}
				</div>
			{/if}
			{#if memberIds.length}
				<div class="flex items-center gap-2 py-2">
					{#each memberIds as id, i (i)}
						{@const user = memberOption.find((ite) => ite.id === id)}
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
		<div class="space-y-3">
			<span class="block text-sm font-medium text-gray-700">Select Board Theme</span>

			<div class="flex gap-4">
				{#each presets as color}
					<button
						type="button"
						aria-label="Select {color.name}"
						onclick={() => (bgColor = color.value)}
						class="group relative h-12 w-12 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 {bgColor ===
						color.value
							? 'border-neutral-400'
							: 'border-neutral-200'}"
						style:background-color={color.value}
					>
						{#if color.value === 'white'}
							<div class="absolute inset-0 flex items-center justify-center bg-white">
								<svg
									class="h-full w-full text-gray-200"
									viewBox="0 0 100 100"
									preserveAspectRatio="none"
								>
									<line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" stroke-width="2" />
								</svg>
								<span class="absolute text-[10px] font-bold text-gray-400 uppercase">None</span>
							</div>
						{/if}
						{#if bgColor === color.value}
							<div class="absolute inset-0 flex items-center justify-center">
								<svg
									class="h-6 w-6 text-green-400 drop-shadow-md"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="3"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		<button
			type="submit"
			class="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
		>
			{board ? 'Update' : 'Create'} Board
		</button>
	</form>
</div>
