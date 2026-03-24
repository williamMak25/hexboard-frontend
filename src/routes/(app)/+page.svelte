<script lang="ts">
	import { browser } from '$app/environment';
	import BoardForm from '$lib/components/forms/BoardForm.svelte';
	import DeleteWarnBox from '$lib/components/UI/DeleteWarnBox.svelte';
	import DropMenu from '$lib/components/UI/DropMenu.svelte';
	import MenuItem from '$lib/components/UI/MenuItem.svelte';
	import Modal from '$lib/components/UI/Modal.svelte';
	import { boardList, deleteBoard } from '$lib/query/board';
	import type { Board } from '$lib/types/board';
	import type { UserProfile } from '$lib/types/user';
	import Icon from '@iconify/svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import toast from 'svelte-5-french-toast';

	let user: UserProfile | null = $derived(
		browser ? JSON.parse(localStorage.getItem('user') ?? '') : null
	);
	let openCreateBoardModal = $state(false);
	let openEditBoardModal = $state(false);
	let selectedBoard: Board | null = $state(null);

	let boardQuery = createQuery(() => ({
		queryKey: ['boards'],
		queryFn: boardList
	}));

	let boardDelteMutation = createMutation(() => ({
		mutationFn: deleteBoard,
		onSuccess: () => {
			boardQuery.refetch();
			toast.success('Successfully deleted.');
			selectedBoard = null;
			openDeleteBox = false;
		},
		onError: () => {
			toast.error('Fail to delete.');
		}
	}));
	let boards = $derived(boardQuery.data ? boardQuery.data?.items : []);

	export function getRandomColor(): string {
		const hue = Math.floor(Math.random() * 360);
		const saturation = 60 + Math.random() * 20; // 60–80%
		const lightness = 45 + Math.random() * 10; // 45–55%
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	let openActionMenu: HTMLButtonElement | null = $state(null);
	let actionMenus: HTMLButtonElement[] = [];
	let openedBoard = '';
	let openDeleteBox = $state(false);
</script>

<!-- <div class="mx-auto max-w-7xl p-8"> -->
<section class=" max-w-7xl p-6">
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each boards as board, i (i)}
			<div
				style="border-color: {board.bgColor};"
				class="group flex min-h-32 flex-col items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
			>
				<div class="flex w-full items-start justify-between">
					<div class="flex items-center gap-2">
						<span class="text-lg font-semibold text-neutral-600">{board.title}</span>
						{#if board.ownerId === user?.id}
							<Icon
								icon="material-symbols:crown-outline-rounded"
								class="text-yellow-400"
								width="24"
								height="24"
							/>
						{/if}
					</div>
					<button
						bind:this={actionMenus[i]}
						class={board.ownerId === user?.id ? 'visible' : 'invisible'}
						onclick={() => {
							openedBoard = board.id;
						}}
					>
						<Icon icon="ph:dots-three-vertical-bold" width="24" height="24" />
						<!-- <Icon icon="basil:edit-outline" width="24" height="24" /> -->
					</button>
					<DropMenu triggerElement={actionMenus[i]} isOpen={openedBoard === board.id}>
						<MenuItem
							onclick={() => {
								selectedBoard = board;
								openDeleteBox = true;
							}}
							><Icon icon="iconoir:bin-full" width="24" height="24" /><span>Delete</span></MenuItem
						>
						<MenuItem
							onclick={() => {
								selectedBoard = board;
								openEditBoardModal = true;
							}}
						>
							<Icon icon="basil:edit-outline" width="24" height="24" />
							<span>Edit</span>
						</MenuItem>
					</DropMenu>
				</div>
				<a href="/{board.id}" class="flex flex-col gap-1">
					<div class="flex flex-col items-start gap-1 text-sm">
						<span class="font-medium text-nowrap text-neutral-700">Owner ID</span>
						<span class="text-xs text-neutral-500">{board.ownerId}</span>
					</div>

					<div class="flex items-center gap-2">
						<p class="text-sm font-medium text-neutral-700">Members:</p>
						{#if board.members.length}
							<div class="flex items-center">
								{#each board.members as member, i (i)}
									<div class="flex items-center gap-2 rounded-full {i > 0 ? '-translate-x-4' : ''}">
										{#if member.avatarUrl}
											<img
												src="http://localhost:8000/uploaded-files/image_1BEA2959-98C8-402B-B2AA-F895ABE543A8_1770024267.png"
												class="h-8 w-8 rounded-full border border-gray-100"
												style="background-color:{getRandomColor()};"
												alt={member.name}
											/>
										{:else}
											<p
												style="background-color:{getRandomColor()};"
												class="flex h-6 w-6 flex-col items-center justify-center rounded-full p-4 text-sm font-medium text-white"
											>
												{member.name.split(' ')[0].slice(0, 1)}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-neutral-700">N/A</p>
						{/if}
					</div>
				</a>
			</div>
		{/each}

		<button
			onclick={() => (openCreateBoardModal = true)}
			class="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 transition-colors hover:border-[#CAD2C5] hover:text-[#2F3E46]"
		>
			<span class="text-3xl">+</span>
			<span class="text-sm font-medium">Create new board</span>
		</button>
	</div>
</section>

<Modal bind:open={openCreateBoardModal}>
	<BoardForm {user} bind:open={openCreateBoardModal} />
</Modal>

<Modal bind:open={openEditBoardModal}>
	<BoardForm {user} bind:open={openEditBoardModal} board={selectedBoard} />
</Modal>

<Modal bind:open={openDeleteBox}>
	<DeleteWarnBox
		bind:open={openDeleteBox}
		handleDelete={() => {
			if (selectedBoard) {
				boardDelteMutation.mutate(selectedBoard?.id);
			}
		}}
	/>
</Modal>
