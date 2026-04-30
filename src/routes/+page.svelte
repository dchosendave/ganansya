<script lang="ts">
	import LoginForm, { type LoginPayload } from '$lib/components/auth/LoginForm.svelte';

	const quickChecks = ['Cash', 'GCash', 'Kita'];

	let notice = $state('');

	function handleLogin(payload: LoginPayload) {
		notice = `Login ready for ${payload.mobileNumber}`;
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

		<LoginForm onSubmit={handleLogin} />

		{#if notice}
			<p
				class="rounded-xl border bg-muted/40 px-3 py-2.5 text-center text-sm font-medium text-muted-foreground"
				role="status"
			>
				{notice}
			</p>
		{/if}
	</section>
</main>
