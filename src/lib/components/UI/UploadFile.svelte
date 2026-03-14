<script lang="ts">
	import { uploadFile } from '$lib/query/board';
	import type { FileType } from '$lib/types/board';
	import axios from 'axios';

	let { id = '', uploadedFiles = $bindable([]) }: { id?: string; uploadedFiles: FileType[] } =
		$props();
	let files = $state<File[]>([]);
	let dragging = $state(false);
	let fileInput: HTMLInputElement;

	async function handleFiles(newFiles: FileList | null) {
		if (!newFiles) return;
		// Convert FileList to Array and append
		files = [...files, ...Array.from(newFiles)];
		let formData = new FormData();
		files.forEach((element) => {
			formData.append('data', element);
		});

		let data = await uploadFile(formData);
		uploadedFiles = [...uploadedFiles, ...data];
		files = []
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
	}
</script>

<div class="mx-auto w-full max-w-xl py-2" {id}>
	<button
		type="button"
		class="relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all
    {dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}"
		ondragover={() => (dragging = true)}
		ondragleave={() => (dragging = false)}
		ondrop={(e) => {
			dragging = false;
			handleFiles(e.dataTransfer?.files ?? null);
		}}
		onclick={() => fileInput.click()}
	>
		<div class="flex flex-col items-center justify-center pt-5 pb-6">
			<svg
				class="mb-3 h-10 w-10 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/>
			</svg>
			<p class="mb-2 text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
			<p class="text-xs text-gray-500">PNG, JPG or PDF (Max 10MB)</p>
		</div>

		<input
			bind:this={fileInput}
			type="file"
			class="hidden"
			multiple
			onchange={(e) => handleFiles(e.currentTarget.files)}
		/>
	</button>

	{#if uploadedFiles.length > 0}
		<ul class="mt-6 space-y-3">
			{#each uploadedFiles as file, i}
				<li
					class="relative flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 shadow-sm"
				>
					{#if ['jpg', 'jpeg', 'png'].includes(file.fileType)}
						<img src={file.filePath} alt={file.fileName} class="max-h-autoo w-full" />
						<button
							onclick={() => removeFile(i)}
							class="absolute right-4 bg-neutral-300 p-1 rounded-full flex items-center justify-center w-6 h-6 top-4 text-white transition-colors hover:text-red-500"
						>
							✕
						</button>
					{:else}
						<div class="flex items-center space-x-3 overflow-hidden">
							<span class="text-blue-500">📄</span>
							<span class="truncate text-sm font-medium">{file.fileName}</span>
							<span class="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
						</div>
						<button
							onclick={() => removeFile(i)}
							class="text-gray-400 transition-colors hover:text-red-500"
						>
							✕
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
