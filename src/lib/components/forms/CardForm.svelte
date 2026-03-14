<script lang="ts">
	import { browser } from '$app/environment';
	import { createCard } from '$lib/query/board';
	import type { CreateCard, FileType } from '$lib/types/board';
	import { PriorityEnum } from '$lib/types/board';
	import type { UserProfile } from '$lib/types/user';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import UploadFile from '../UI/UploadFile.svelte';
	import RichTextEditor from '../UI/RichTextEditor.svelte';

	let { columnId, open = $bindable(false) }: { columnId: string; open: boolean } = $props();

	const client = useQueryClient();

	let user: UserProfile = $derived(browser ? JSON.parse(localStorage.getItem('user') ?? '') : null);

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
			assigneeIds: [],
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
