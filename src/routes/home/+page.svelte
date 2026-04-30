<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	import type { AuthApiResponse } from '$lib/auth/types';
	import { getHomeModulesForRole } from '$lib/auth/modules';
	import { Button } from '$lib/components/ui/button/index.js';

	type BalanceItem = {
		label: string;
		value: string;
	};

	const dashboard = {
		dayLabel: 'Monday, 8:40 AM',
		statusTitle: 'Low GCash, limit muna ang Cash In',
		statusMessage:
			'Pwede pa ang Cash Out. Mag-rebalance muna bago tumanggap ng mas malaking Cash In.',
		updatedAt: '2:14 PM',
		cash: 'PHP 8,420',
		gcash: 'PHP 2,680',
		kitaToday: 'PHP 340',
		transactionsToday: 14,
		totalFeesToday: 'PHP 340',
		lastLog: 'Cash Out, PHP 500 at 2:14 PM',
		cashBelowThreshold: false,
		gcashBelowThreshold: true,
		needsReconciliation: true
	};

	const balances: BalanceItem[] = [
		{ label: 'Cash', value: dashboard.cash },
		{ label: 'GCash', value: dashboard.gcash },
		{ label: 'Kita Today', value: dashboard.kitaToday }
	];

	let { data }: PageProps = $props();
	const primaryStatusTone = dashboard.gcashBelowThreshold || dashboard.cashBelowThreshold;
	const cashInDisabled = dashboard.gcashBelowThreshold;
	const cashOutDisabled = dashboard.cashBelowThreshold;
	let isLoggingOut = $state(false);
	let logoutErrorMessage = $state('');
	let homeModules = $derived(data.currentUser ? getHomeModulesForRole(data.currentUser.role) : []);
	let roleLabel = $derived(data.currentUser?.role === 'owner' ? 'Owner access' : 'Operator access');

	async function handleLogout() {
		logoutErrorMessage = '';
		isLoggingOut = true;

		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				}
			});
			const result = (await response.json()) as AuthApiResponse;

			if (response.ok && result.ok) {
				await goto(result.redirectTo);
				return;
			}

			if (!result.ok) {
				logoutErrorMessage = result.message;
				return;
			}

			logoutErrorMessage = 'Hindi ma-log out ngayon. Subukan ulit.';
		} catch {
			logoutErrorMessage = 'Hindi ma-log out ngayon. Subukan ulit.';
		} finally {
			isLoggingOut = false;
		}
	}
</script>

<svelte:head>
	<title>Home | Ganansya</title>
	<meta
		name="description"
		content="Ganansya operator home for balance checks, transaction actions, and quick daily controls."
	/>
</svelte:head>

<main class="min-h-svh bg-background px-4 py-5 text-foreground sm:px-6 sm:py-8">
	<section class="mx-auto flex w-full max-w-sm flex-col gap-4">
		<header class="space-y-3">
			<div class="flex items-start justify-between gap-3">
				<div class="space-y-2">
					<p class="text-sm font-medium text-muted-foreground">{dashboard.dayLabel}</p>
					<p class="text-sm font-semibold text-muted-foreground">
						Hi, {data.currentUser?.displayName}. <span class="ml-1">{roleLabel}</span>
					</p>
				</div>

				<Button
					type="button"
					variant="outline"
					size="sm"
					class="h-10 bg-card"
					disabled={isLoggingOut}
					onclick={handleLogout}
				>
					{isLoggingOut ? 'Logging out...' : 'Logout'}
				</Button>
			</div>

			<h1 class="text-3xl leading-tight font-semibold tracking-normal">Ready ang tindahan</h1>
			<p class="max-w-[28ch] text-sm leading-5 text-muted-foreground">
				Silipin ang float, pili ng transaction, tapos tuloy agad sa customer.
			</p>
		</header>

		{#if logoutErrorMessage}
			<p
				class="rounded-2xl border border-destructive/15 bg-destructive/8 px-3.5 py-3 text-sm leading-5 font-medium text-destructive"
				role="alert"
			>
				{logoutErrorMessage}
			</p>
		{/if}

		<section class="rounded-[2rem] border border-border/80 bg-card px-4 py-4 shadow-sm">
			<div class="flex items-start justify-between gap-3">
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">Status ngayon</p>
					<h2 class="text-lg leading-6 font-semibold">{dashboard.statusTitle}</h2>
				</div>
				<p
					class={[
						'rounded-full px-3 py-1 text-[0.72rem] font-semibold',
						primaryStatusTone ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'
					]}
				>
					{primaryStatusTone ? 'Watch buffer' : 'All good'}
				</p>
			</div>

			<p class="mt-2 max-w-[31ch] text-sm leading-5 text-muted-foreground">
				{dashboard.statusMessage}
			</p>

			<div class="mt-4 border-t border-border/80 pt-4">
				<div class="grid grid-cols-3 gap-2">
					{#each balances as balance (balance.label)}
						<div class="rounded-2xl bg-muted/35 px-3 py-3">
							<p
								class="text-[0.72rem] font-semibold tracking-[0.04em] text-muted-foreground uppercase"
							>
								{balance.label}
							</p>
							<p class="mt-2 text-base leading-5 font-semibold">{balance.value}</p>
						</div>
					{/each}
				</div>

				<div
					class="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground"
				>
					<p>{dashboard.transactionsToday} logs today</p>
					<p>{dashboard.totalFeesToday} fees</p>
					<p>Updated {dashboard.updatedAt}</p>
				</div>
			</div>

			<div class="mt-4 border-t border-border/80 pt-4">
				<div class="grid grid-cols-2 gap-3">
					<Button size="lg" class="h-14" disabled={cashInDisabled}>Cash In</Button>
					<Button size="lg" variant="outline" class="h-14 bg-card" disabled={cashOutDisabled}>
						Cash Out
					</Button>
				</div>

				{#if cashInDisabled || cashOutDisabled}
					<p class="mt-2 text-sm leading-5 text-muted-foreground">
						{cashInDisabled
							? 'Cash In is limited habang mababa ang GCash buffer.'
							: 'Cash Out is limited habang mababa ang cash buffer.'}
					</p>
				{/if}
			</div>

			<div class="mt-4 border-t border-border/80 pt-4">
				<p class="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">
					Last log
				</p>
				<p class="mt-1 text-sm leading-5 font-medium">{dashboard.lastLog}</p>
			</div>
		</section>

		<section class="space-y-3" aria-labelledby="home-modules-title">
			<div class="space-y-1">
				<p class="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">
					Quick access
				</p>
				<h2 id="home-modules-title" class="text-lg leading-6 font-semibold">
					Mga module mo ngayon
				</h2>
			</div>

			<div class="grid gap-3">
				{#each homeModules as module (module.id)}
					<a
						href={module.href}
						class="rounded-[1.6rem] border border-border/80 bg-card px-4 py-4 shadow-sm transition-transform hover:-translate-y-0.5"
					>
						<div class="flex items-start justify-between gap-3">
							<div class="space-y-2">
								<h3 class="text-base font-semibold">{module.label}</h3>
								<p class="max-w-[28ch] text-sm leading-5 text-muted-foreground">
									{module.description}
								</p>
							</div>
							<span
								class="rounded-full bg-muted px-2.5 py-1 text-[0.72rem] font-semibold text-muted-foreground"
							>
								Open
							</span>
						</div>
					</a>
				{/each}
			</div>
		</section>
	</section>
</main>
