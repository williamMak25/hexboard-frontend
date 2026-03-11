<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { login, userMe } from '$lib/query/auth';
	import toast from 'svelte-5-french-toast';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	const handleLogin = async () => {
		try {
			const cleanUsername = email.trim();
			const cleanPassword = password.trim();
			let response = await login({ username: cleanUsername, password: cleanPassword });

			let data = response.data;
			localStorage.setItem('accessToken', data.access_token);
			let token = browser ? localStorage.getItem('accessToken') : null;
			if (token) {
				let me = await userMe();

				let user = {
					id: me.id,
					name: me.name,
					email: me.email,
					token: data.access_token,
					role: me.roles,
					teamName: me.teams,
					isSuperuser: me.isSuperuser
				};

				localStorage.setItem('user', JSON.stringify(user));
				toast.success('Successfully Signed In');

			// 	if (user.isSuperuser) {
			// 		goto('/admin');
			// 	} else {
			goto('/');
			// 	}
			}
		} catch (e: any) {
			if (e.status === 403) {
				toast.error(e.response.data.title);
			} else {
				toast.error(e.message);
			}
		}
	};
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6">
	<div class="mb-8 flex items-center gap-2">
		<div class="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-200">
			<div class="mb-1 h-2 w-4 rounded-sm bg-white/40"></div>
		</div>
		<h1 class="text-3xl font-extrabold tracking-tight text-slate-800">Hex Board</h1>
	</div>

	<div class="w-full max-w-md rounded-sm border border-slate-200 bg-white p-8 shadow-xl">
		<h2 class="mb-6 text-center font-semibold text-slate-600">Log in to continue</h2>

		<form onsubmit={handleLogin} class="space-y-4">
			<div>
				<input
					type="email"
					bind:value={email}
					placeholder="Enter email"
					class="w-full rounded-lg border-2 border-slate-200 p-2 transition-colors focus:border-blue-500 focus:outline-none"
					required
				/>
			</div>

			<div>
				<input
					type="password"
					bind:value={password}
					placeholder="Enter password"
					class="w-full rounded-lg border-2 border-slate-200 p-2 transition-colors focus:border-blue-500 focus:outline-none"
					required
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-sm bg-indigo-600 py-2 font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
			>
				{loading ? 'Logging in...' : 'Log In'}
			</button>
		</form>

		<div class="mt-6 border-t border-slate-100 pt-6 text-center">
			<a href="/signup" class="text-sm text-blue-600 hover:underline"
				>Can't log in? • Create an account</a
			>
		</div>
	</div>

	<footer class="mt-8 flex gap-4 text-xs text-slate-400">
		<span>Privacy Policy</span>
		<span>Terms of Service</span>
	</footer>
</div>
