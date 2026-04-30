<script lang="ts">
	import { goto } from '$app/navigation';

	import type { AuthApiResponse, LoginFieldErrors } from '$lib/auth/types';
	import LoginForm, { type LoginPayload } from '$lib/components/auth/LoginForm.svelte';

	const quickChecks = ['Cash', 'GCash', 'Kita'];

	let isLoading = $state(false);
	let serverMessage = $state('');
	let serverFieldErrors = $state<LoginFieldErrors | null>(null);

	function clearServerErrors() {
		serverMessage = '';
		serverFieldErrors = null;
	}

	async function handleLogin(payload: LoginPayload) {
		clearServerErrors();
		isLoading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			const result = (await response.json()) as AuthApiResponse;

			if (response.ok && result.ok) {
				await goto(result.redirectTo);
				return;
			}

			if (!result.ok) {
				serverMessage = result.message;
				serverFieldErrors = result.fieldErrors ?? null;
				return;
			}

			serverMessage = 'Hindi ma-process ang login ngayon. Subukan ulit.';
		} catch {
			serverMessage = 'Hindi ma-process ang login ngayon. Subukan ulit.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login | Ganansya</title>
	<meta name="description" content="Ganansya tindahan login for store operators." />
</svelte:head>

<main class="min-h-svh bg-background px-4 py-5 text-foreground sm:py-8">
	<section
		class="mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-sm flex-col justify-center gap-5 sm:min-h-[calc(100svh-4rem)]"
		aria-labelledby="login-title"
	>
		<div class="space-y-5 text-center">
			<div
				class="mx-auto grid size-16 place-items-center rounded-4xl border bg-card text-3xl font-semibold shadow-sm"
				aria-hidden="true"
			>
				G
			</div>

			<div class="space-y-2.5">
				<p class="text-sm font-semibold text-muted-foreground">Ganansya</p>
				<h1 id="login-title" class="text-3xl leading-tight font-semibold tracking-normal">
					Ready na ang tindahan
				</h1>
				<p class="mx-auto max-w-[19rem] text-base leading-6 text-muted-foreground">
					Pasok muna para makita ang cash, GCash, at kita today.
				</p>
			</div>
		</div>

		<ul
			class="grid grid-cols-3 gap-2 text-center text-sm font-semibold text-muted-foreground"
			aria-label="Quick checks after login"
		>
			{#each quickChecks as quickCheck (quickCheck)}
				<li class="rounded-xl border bg-muted/40 px-3 py-2.5">{quickCheck}</li>
			{/each}
		</ul>

		<LoginForm
			onSubmit={handleLogin}
			onInput={clearServerErrors}
			{isLoading}
			{serverMessage}
			{serverFieldErrors}
		/>
	</section>
</main>
