<script lang="ts">
	import LoginForm, { type LoginPayload } from '$lib/components/auth/LoginForm.svelte';

	let notice = $state('');

	function handleLogin(payload: LoginPayload) {
		notice = `Login ready for ${payload.mobileNumber}`;
	}
</script>

<svelte:head>
	<title>Login | Ganansya</title>
	<meta name="description" content="Ganansya store login." />
</svelte:head>

<main class="min-h-svh bg-background px-4 py-6 text-foreground">
	<section class="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-sm flex-col justify-center gap-6">
		<div class="space-y-4 text-center">
			<div class="mx-auto grid size-14 place-items-center rounded-4xl border bg-card text-2xl font-semibold shadow-sm">
				G
			</div>

			<div class="space-y-2">
				<p class="text-sm font-medium text-muted-foreground">Ganansya</p>
				<h1 class="text-3xl font-semibold tracking-normal">Ready na ba ang tindahan?</h1>
				<p class="mx-auto max-w-[18rem] text-sm leading-6 text-muted-foreground">
					Login muna para ma-check ang cash, GCash, at kita today.
				</p>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-2 text-center text-xs font-medium text-muted-foreground">
			<div class="rounded-lg border bg-muted/40 px-3 py-2">Cash In</div>
			<div class="rounded-lg border bg-muted/40 px-3 py-2">Cash Out</div>
			<div class="rounded-lg border bg-muted/40 px-3 py-2">Kita</div>
		</div>

		<LoginForm onSubmit={handleLogin} />

		{#if notice}
			<p class="rounded-lg border bg-muted/40 px-3 py-2 text-center text-sm font-medium text-muted-foreground" role="status">
				{notice}
			</p>
		{/if}
	</section>
</main>
