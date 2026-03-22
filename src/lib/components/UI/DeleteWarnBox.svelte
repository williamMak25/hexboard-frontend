<script lang="ts">
	let {
		open = $bindable(false),
		handleDelete = () => {}
	}: { open: boolean; handleDelete: () => void } = $props();
</script>

<div
	class="w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-2xl transition-all"
>
	<div class="p-6">
		<div class="flex items-center gap-4">
			<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
				<svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			<div>
				<h3 class="text-lg font-semibold text-slate-900">Confirm Deletion</h3>
				<p class="mt-1 text-sm text-slate-500">
					Are you sure you want to delete this item? This action is permanent and cannot be undone.
				</p>
			</div>
		</div>
	</div>

	<div class="flex flex-row-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
		<button
			onclick={handleDelete}
			class="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-red-200 transition-colors hover:bg-red-700"
		>
			Delete Item
		</button>
		<button
			onclick={() => (open = false)}
			class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
		>
			Cancel
		</button>
	</div>
</div>
