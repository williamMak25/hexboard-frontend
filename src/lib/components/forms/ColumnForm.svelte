<script lang="ts">
	import { createColumn } from '$lib/query/board';
	import type { CreateColumn } from '$lib/types/board';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import toast from 'svelte-5-french-toast';

	let { boardId, open = $bindable(false) }: { boardId: string; open: boolean } = $props();

	const client = useQueryClient();

	let title = $state('');

	let createColumnMutation = createMutation(() => ({
		mutationFn: createColumn,
		onSuccess: () => {
			toast.success('Column created successfully');
			title = '';
			boardId = '';
			open = false;
            client.invalidateQueries({queryKey:['columns']})
		},
		onError: () => {
			toast.error('Failed to create column');
		}
	}));

	const handleSubmit = () => {
		let data: CreateColumn = {
			title,
			boardId
		};
		createColumnMutation.mutate(data);
	};
</script>

<form onsubmit={handleSubmit}>
	<div class="mb-4">
		<label for="title" class="mb-2 block text-sm font-medium text-gray-900">Title</label>
		<input
			type="text"
			id="title"
			class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
			placeholder="Column title"
			bind:value={title}
		/>
	</div>

	<div class="flex items-center gap-4">
		<button
			type="button"
			class="mr-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300 focus:outline-none"
			onclick={() => (open = false)}
		>
			Cancel
		</button>
		<button
			type="submit"
			class="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
		>
			Create Column
		</button>
	</div>
</form>
