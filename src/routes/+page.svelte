<script lang="ts">
	import LoginForm, { type LoginPayload } from '$lib/components/auth/LoginForm.svelte';
	import { onMount } from 'svelte';

	let notice = $state('');
	let message = $state('');

	function handleLogin(payload: LoginPayload) {
		notice = `Login ready for ${payload.mobileNumber}`;
	}

	onMount(() => {
		message = 'Uy, ready na sa business? Login na para makapagsimula!';
	});
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Ganansya store login." />
</svelte:head>

<main class="min-h-svh bg-muted/30 px-4 py-6">
	<section
		class="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-sm flex-col justify-center gap-6"
	>
		<div class="space-y-1 text-center">
			<h1 class="text-3xl font-semibold">Ganansya</h1>
			<p class="text-sm font-medium text-muted-foreground">{message}</p>
		</div>

		<LoginForm onSubmit={handleLogin} />

		{#if notice}
			<p class="text-center text-sm font-medium text-muted-foreground" role="status">{notice}</p>
		{/if}
	</section>
</main>
