<script lang="ts">
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<main class="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
	<header class="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
		<div class="flex items-center gap-4">
			<a class="text-xl font-semibold tracking-tight" href={resolve('/')}> Development Board </a>
			<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
				>v1.0.4</span
			>
		</div>
		<button
			onclick={() => {
				localStorage.clear();
				window.location.replace('/login');
			}}
			class="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 hover:shadow-lg active:scale-95"
		>
			Logout
		</button>
	</header>
	{@render children()}
</main>
