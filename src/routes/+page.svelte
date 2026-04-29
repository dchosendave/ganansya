<script lang="ts">
	type View = 'dashboard' | 'transaction' | 'history' | 'reconcile' | 'fees' | 'reports';
	type TransactionType = 'cash-in' | 'cash-out';
	type FeeMode = 'add' | 'deduct';

	type FeeRule = {
		id: string;
		min: number;
		max: number;
		fee: number;
	};

	type Transaction = {
		id: string;
		type: TransactionType;
		amount: number;
		fee: number;
		feeMode: FeeMode;
		reference: string;
		createdAt: string;
		operator: string;
	};

	const initialFloat = {
		cash: 10000,
		gcash: 10000
	};

	const views: Array<{ id: View; label: string; short: string }> = [
		{ id: 'dashboard', label: 'Today', short: 'Today' },
		{ id: 'transaction', label: 'New', short: 'New' },
		{ id: 'history', label: 'History', short: 'Logs' },
		{ id: 'reconcile', label: 'Reconcile', short: 'End' },
		{ id: 'fees', label: 'Fees', short: 'Fees' },
		{ id: 'reports', label: 'Reports', short: 'Rpt' }
	];

	const now = new Date();
	const todayStart = startOfDay(now);
	const yesterdayStart = addDays(todayStart, -1);
	const twoDaysAgoStart = addDays(todayStart, -2);
	const fiveDaysAgoStart = addDays(todayStart, -5);

	let activeView = $state<View>('dashboard');
	let isUnlocked = $state(false);
	let pin = $state('');
	let pinError = $state('');
	let transactionType = $state<TransactionType>('cash-in');
	let feeMode = $state<FeeMode>('add');
	let amount = $state<number | undefined>(500);
	let reference = $state('');
	let operator = $state('Tindera');
	let actualCash = $state<number | undefined>(10485);
	let actualGcash = $state<number | undefined>(9580);

	let feeRules = $state<FeeRule[]>([
		{ id: 'tier-1', min: 1, max: 500, fee: 5 },
		{ id: 'tier-2', min: 501, max: 1000, fee: 10 },
		{ id: 'tier-3', min: 1001, max: 2000, fee: 15 },
		{ id: 'tier-4', min: 2001, max: 5000, fee: 20 },
		{ id: 'tier-5', min: 5001, max: 10000, fee: 30 }
	]);

	let transactions = $state<Transaction[]>([
		{
			id: 'tx-1005',
			type: 'cash-in',
			amount: 500,
			fee: 5,
			feeMode: 'add',
			reference: 'CI-9124',
			createdAt: atTime(todayStart, 8, 15),
			operator: 'Lina'
		},
		{
			id: 'tx-1004',
			type: 'cash-out',
			amount: 800,
			fee: 10,
			feeMode: 'deduct',
			reference: 'CO-5831',
			createdAt: atTime(todayStart, 9, 40),
			operator: 'Lina'
		},
		{
			id: 'tx-1003',
			type: 'cash-in',
			amount: 1200,
			fee: 15,
			feeMode: 'deduct',
			reference: 'CI-7748',
			createdAt: atTime(yesterdayStart, 13, 5),
			operator: 'Lina'
		},
		{
			id: 'tx-1002',
			type: 'cash-out',
			amount: 300,
			fee: 5,
			feeMode: 'add',
			reference: 'CO-4427',
			createdAt: atTime(twoDaysAgoStart, 16, 22),
			operator: 'Lina'
		},
		{
			id: 'tx-1001',
			type: 'cash-in',
			amount: 2500,
			fee: 20,
			feeMode: 'add',
			reference: 'CI-1189',
			createdAt: atTime(fiveDaysAgoStart, 11, 10),
			operator: 'Lina'
		}
	]);

	let activeAmount = $derived(Math.max(0, Number(amount) || 0));
	let activeFee = $derived(computeFee(activeAmount));
	let transactionPreview = $derived(
		buildTransactionMath({
			type: transactionType,
			amount: activeAmount,
			fee: activeFee,
			feeMode
		})
	);
	let isTransactionReady = $derived(
		activeAmount > 0 && reference.trim().length > 0 && transactionPreview.customerReceives > 0
	);
	let orderedTransactions = $derived(
		[...transactions].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
	);
	let todayTransactions = $derived(
		transactions.filter((transaction) => isSameDay(transaction.createdAt, now))
	);
	let weekTransactions = $derived(
		transactions.filter(
			(transaction) => Date.parse(transaction.createdAt) >= addDays(todayStart, -6).getTime()
		)
	);
	let expectedCash = $derived(
		initialFloat.cash + transactions.reduce((sum, transaction) => sum + cashDelta(transaction), 0)
	);
	let expectedGcash = $derived(
		initialFloat.gcash + transactions.reduce((sum, transaction) => sum + gcashDelta(transaction), 0)
	);
	let todayProfit = $derived(totalFee(todayTransactions));
	let weekProfit = $derived(totalFee(weekTransactions));
	let cashStatus = $derived(expectedCash < 3000 ? 'Limit Cash Out' : 'Ready');
	let gcashStatus = $derived(expectedGcash < 3000 ? 'Limit Cash In' : 'Ready');
	let cashDifference = $derived((Number(actualCash) || 0) - expectedCash);
	let gcashDifference = $derived((Number(actualGcash) || 0) - expectedGcash);
	let totalDifference = $derived(cashDifference + gcashDifference);
	let cashInToday = $derived(
		todayTransactions.filter((transaction) => transaction.type === 'cash-in').length
	);
	let cashOutToday = $derived(
		todayTransactions.filter((transaction) => transaction.type === 'cash-out').length
	);

	const money = new Intl.NumberFormat('en-PH', {
		style: 'currency',
		currency: 'PHP',
		maximumFractionDigits: 0
	});

	const numberFormat = new Intl.NumberFormat('en-PH');

	const timeFormat = new Intl.DateTimeFormat('en-PH', {
		hour: 'numeric',
		minute: '2-digit'
	});

	const dateFormat = new Intl.DateTimeFormat('en-PH', {
		month: 'short',
		day: 'numeric'
	});

	function unlock(event: SubmitEvent) {
		event.preventDefault();

		if (pin.trim().length < 4) {
			pinError = '4-digit PIN';
			return;
		}

		isUnlocked = true;
		pinError = '';
	}

	function addTransaction(event: SubmitEvent) {
		event.preventDefault();

		if (!isTransactionReady) {
			return;
		}

		transactions.push({
			id: `tx-${Date.now()}`,
			type: transactionType,
			amount: activeAmount,
			fee: activeFee,
			feeMode,
			reference: reference.trim(),
			createdAt: new Date().toISOString(),
			operator: operator.trim() || 'Tindera'
		});

		reference = '';
		amount = 500;
		activeView = 'dashboard';
	}

	function addFeeTier() {
		const lastRule = [...feeRules].sort((a, b) => b.max - a.max)[0];
		const nextMin = lastRule ? lastRule.max + 1 : 1;

		feeRules.push({
			id: `tier-${Date.now()}`,
			min: nextMin,
			max: nextMin + 499,
			fee: 10
		});
	}

	function sortFeeTiers() {
		feeRules = [...feeRules].sort((a, b) => a.min - b.min);
	}

	function removeFeeTier(id: string) {
		if (feeRules.length === 1) {
			return;
		}

		feeRules = feeRules.filter((rule) => rule.id !== id);
	}

	function computeFee(value: number) {
		const rule = [...feeRules]
			.sort((a, b) => a.min - b.min)
			.find((feeRule) => value >= feeRule.min && value <= feeRule.max);

		return rule?.fee ?? 0;
	}

	function cashDelta(transaction: Pick<Transaction, 'type' | 'amount' | 'fee' | 'feeMode'>) {
		return buildTransactionMath(transaction).cashDelta;
	}

	function gcashDelta(transaction: Pick<Transaction, 'type' | 'amount' | 'fee' | 'feeMode'>) {
		return buildTransactionMath(transaction).gcashDelta;
	}

	function buildTransactionMath(
		transaction: Pick<Transaction, 'type' | 'amount' | 'fee' | 'feeMode'>
	) {
		const amountValue = Math.max(0, transaction.amount);
		const feeValue = Math.max(0, transaction.fee);
		const deductPayout = Math.max(0, amountValue - feeValue);

		if (transaction.type === 'cash-in') {
			return transaction.feeMode === 'add'
				? {
						cashDelta: amountValue + feeValue,
						gcashDelta: -amountValue,
						customerPays: amountValue + feeValue,
						customerReceives: amountValue
					}
				: {
						cashDelta: amountValue,
						gcashDelta: -deductPayout,
						customerPays: amountValue,
						customerReceives: deductPayout
					};
		}

		return transaction.feeMode === 'add'
			? {
					cashDelta: -amountValue,
					gcashDelta: amountValue + feeValue,
					customerPays: amountValue + feeValue,
					customerReceives: amountValue
				}
			: {
					cashDelta: -deductPayout,
					gcashDelta: amountValue,
					customerPays: amountValue,
					customerReceives: deductPayout
				};
	}

	function transactionLabel(type: TransactionType) {
		return type === 'cash-in' ? 'Cash In' : 'Cash Out';
	}

	function feeModeLabel(mode: FeeMode) {
		return mode === 'add' ? 'Add fee' : 'Deduct fee';
	}

	function totalFee(items: Transaction[]) {
		return items.reduce((sum, transaction) => sum + transaction.fee, 0);
	}

	function startOfDay(date: Date) {
		const copy = new Date(date);
		copy.setHours(0, 0, 0, 0);
		return copy;
	}

	function addDays(date: Date, days: number) {
		const copy = new Date(date);
		copy.setDate(copy.getDate() + days);
		return copy;
	}

	function atTime(date: Date, hour: number, minute: number) {
		const copy = new Date(date);
		copy.setHours(hour, minute, 0, 0);
		return copy.toISOString();
	}

	function isSameDay(value: string, date: Date) {
		const transactionDate = new Date(value);
		return (
			transactionDate.getFullYear() === date.getFullYear() &&
			transactionDate.getMonth() === date.getMonth() &&
			transactionDate.getDate() === date.getDate()
		);
	}
</script>

<svelte:head>
	<title>Ganansya</title>
	<meta
		name="description"
		content="Ganansya cash in and cash out float management for sari-sari stores."
	/>
</svelte:head>

{#if !isUnlocked}
	<main class="login-shell">
		<section class="login-panel" aria-labelledby="login-title">
			<div class="brand-lockup">
				<div class="brand-mark" aria-hidden="true">G</div>
				<div>
					<p class="eyebrow">Ganansya</p>
					<h1 id="login-title">Store PIN</h1>
				</div>
			</div>

			<form class="pin-form" onsubmit={unlock}>
				<label for="pin">PIN</label>
				<input
					id="pin"
					name="pin"
					type="password"
					inputmode="numeric"
					autocomplete="current-password"
					maxlength="6"
					bind:value={pin}
				/>
				{#if pinError}
					<p class="form-error">{pinError}</p>
				{/if}
				<button class="primary-action" type="submit">Open</button>
			</form>
		</section>
	</main>
{:else}
	<div class="app-shell">
		<header class="topbar">
			<div class="brand-lockup">
				<div class="brand-mark" aria-hidden="true">G</div>
				<div>
					<p class="eyebrow">Ganansya</p>
					<h1>Float Center</h1>
				</div>
			</div>

			<div class="operator-pill">
				<span>{operator}</span>
				<button type="button" onclick={() => (isUnlocked = false)}>Lock</button>
			</div>
		</header>

		<nav class="view-tabs" aria-label="Main sections">
			{#each views as view (view.id)}
				<button
					type="button"
					class:active={activeView === view.id}
					aria-pressed={activeView === view.id}
					onclick={() => (activeView = view.id)}
				>
					<span class="tab-label">{view.label}</span>
					<span class="tab-short">{view.short}</span>
				</button>
			{/each}
		</nav>

		<main class="workspace">
			{#if activeView === 'dashboard'}
				<section class="view-header" aria-labelledby="dashboard-title">
					<div>
						<p class="eyebrow">Today</p>
						<h2 id="dashboard-title">Dashboard</h2>
					</div>
					<button
						class="primary-action compact"
						type="button"
						onclick={() => (activeView = 'transaction')}
					>
						New
					</button>
				</section>

				<section class="metric-grid" aria-label="Current balances">
					<article class="metric-card cash">
						<p>Cash on Hand</p>
						<strong>{money.format(expectedCash)}</strong>
						<span>{cashStatus}</span>
					</article>
					<article class="metric-card gcash">
						<p>GCash Balance</p>
						<strong>{money.format(expectedGcash)}</strong>
						<span>{gcashStatus}</span>
					</article>
					<article class="metric-card profit">
						<p>Kita Today</p>
						<strong>{money.format(todayProfit)}</strong>
						<span>{todayTransactions.length} transactions</span>
					</article>
				</section>

				<section class="split-layout">
					<div class="section-block">
						<div class="section-title">
							<h3>Transaction Mix</h3>
							<span>{dateFormat.format(now)}</span>
						</div>
						<div class="two-stat-row">
							<div>
								<span>Cash In</span>
								<strong>{numberFormat.format(cashInToday)}</strong>
							</div>
							<div>
								<span>Cash Out</span>
								<strong>{numberFormat.format(cashOutToday)}</strong>
							</div>
						</div>
					</div>

					<div class="section-block">
						<div class="section-title">
							<h3>Low Float Rules</h3>
							<span>₱3,000 buffer</span>
						</div>
						<div class="rule-list">
							<p class:warning={expectedCash < 3000}>Cash below buffer limits Cash Out.</p>
							<p class:warning={expectedGcash < 3000}>GCash below buffer limits Cash In.</p>
						</div>
					</div>
				</section>

				<section class="section-block">
					<div class="section-title">
						<h3>Recent Logs</h3>
						<button type="button" onclick={() => (activeView = 'history')}>View all</button>
					</div>
					<div class="transaction-list">
						{#each orderedTransactions.slice(0, 3) as transaction (transaction.id)}
							<article class="transaction-row">
								<div>
									<strong>{transactionLabel(transaction.type)}</strong>
									<span
										>{timeFormat.format(new Date(transaction.createdAt))} · {transaction.reference}</span
									>
								</div>
								<div>
									<strong>{money.format(transaction.amount)}</strong>
									<span>{money.format(transaction.fee)} fee</span>
								</div>
							</article>
						{/each}
					</div>
				</section>
			{:else if activeView === 'transaction'}
				<section class="view-header" aria-labelledby="transaction-title">
					<div>
						<p class="eyebrow">New Transaction</p>
						<h2 id="transaction-title">{transactionLabel(transactionType)}</h2>
					</div>
				</section>

				<form class="entry-form" onsubmit={addTransaction}>
					<div class="segmented-control" aria-label="Transaction type">
						<button
							type="button"
							class:active={transactionType === 'cash-in'}
							onclick={() => (transactionType = 'cash-in')}
						>
							↑ Cash In
						</button>
						<button
							type="button"
							class:active={transactionType === 'cash-out'}
							onclick={() => (transactionType = 'cash-out')}
						>
							↓ Cash Out
						</button>
					</div>

					<div class="form-grid">
						<label>
							<span>Amount</span>
							<input type="number" inputmode="numeric" min="1" step="1" bind:value={amount} />
						</label>
						<label>
							<span>Bayad</span>
							<input type="text" readonly value={money.format(activeFee)} />
						</label>
					</div>

					<div class="segmented-control" aria-label="Fee mode">
						<button
							type="button"
							class:active={feeMode === 'add'}
							onclick={() => (feeMode = 'add')}
						>
							Add fee
						</button>
						<button
							type="button"
							class:active={feeMode === 'deduct'}
							onclick={() => (feeMode = 'deduct')}
						>
							Deduct fee
						</button>
					</div>

					<div class="preview-grid">
						<div>
							<span>Customer Pays</span>
							<strong>{money.format(transactionPreview.customerPays)}</strong>
						</div>
						<div>
							<span>Customer Gets</span>
							<strong>{money.format(transactionPreview.customerReceives)}</strong>
						</div>
						<div>
							<span>Cash Change</span>
							<strong>{money.format(transactionPreview.cashDelta)}</strong>
						</div>
						<div>
							<span>GCash Change</span>
							<strong>{money.format(transactionPreview.gcashDelta)}</strong>
						</div>
					</div>

					<div class="form-grid">
						<label>
							<span>Reference No.</span>
							<input
								type="text"
								autocomplete="off"
								placeholder="GCash ref"
								bind:value={reference}
							/>
						</label>
						<label>
							<span>Operator</span>
							<input type="text" autocomplete="name" bind:value={operator} />
						</label>
					</div>

					<div class="action-row">
						<button
							class="secondary-action"
							type="button"
							onclick={() => (activeView = 'dashboard')}
						>
							Cancel
						</button>
						<button class="primary-action" type="submit" disabled={!isTransactionReady}
							>Confirm</button
						>
					</div>
				</form>
			{:else if activeView === 'history'}
				<section class="view-header" aria-labelledby="history-title">
					<div>
						<p class="eyebrow">Logs</p>
						<h2 id="history-title">Transaction History</h2>
					</div>
				</section>

				<section class="section-block">
					<div class="transaction-list wide">
						{#each orderedTransactions as transaction (transaction.id)}
							<article class="transaction-row">
								<div>
									<strong>{transactionLabel(transaction.type)}</strong>
									<span>
										{dateFormat.format(new Date(transaction.createdAt))}
										· {timeFormat.format(new Date(transaction.createdAt))}
										· {transaction.reference}
									</span>
								</div>
								<div>
									<strong>{money.format(transaction.amount)}</strong>
									<span>{feeModeLabel(transaction.feeMode)} · {money.format(transaction.fee)}</span>
								</div>
							</article>
						{/each}
					</div>
				</section>
			{:else if activeView === 'reconcile'}
				<section class="view-header" aria-labelledby="reconcile-title">
					<div>
						<p class="eyebrow">End of Day</p>
						<h2 id="reconcile-title">Reconciliation</h2>
					</div>
				</section>

				<section class="metric-grid compact-metrics" aria-label="Expected balances">
					<article class="metric-card cash">
						<p>Expected Cash</p>
						<strong>{money.format(expectedCash)}</strong>
					</article>
					<article class="metric-card gcash">
						<p>Expected GCash</p>
						<strong>{money.format(expectedGcash)}</strong>
					</article>
					<article class="metric-card profit">
						<p>Expected Kita</p>
						<strong>{money.format(todayProfit)}</strong>
					</article>
				</section>

				<section class="entry-form">
					<div class="form-grid">
						<label>
							<span>Actual Cash</span>
							<input type="number" inputmode="numeric" min="0" step="1" bind:value={actualCash} />
						</label>
						<label>
							<span>Actual GCash</span>
							<input type="number" inputmode="numeric" min="0" step="1" bind:value={actualGcash} />
						</label>
					</div>

					<div class="preview-grid">
						<div>
							<span>Cash Diff</span>
							<strong class:bad-diff={cashDifference !== 0}>{money.format(cashDifference)}</strong>
						</div>
						<div>
							<span>GCash Diff</span>
							<strong class:bad-diff={gcashDifference !== 0}>{money.format(gcashDifference)}</strong
							>
						</div>
						<div class="full-span">
							<span>Total Diff</span>
							<strong class:bad-diff={totalDifference !== 0}>{money.format(totalDifference)}</strong
							>
						</div>
					</div>
				</section>
			{:else if activeView === 'fees'}
				<section class="view-header" aria-labelledby="fees-title">
					<div>
						<p class="eyebrow">Owner Setup</p>
						<h2 id="fees-title">Pricing Rules</h2>
					</div>
					<button class="primary-action compact" type="button" onclick={addFeeTier}>Add</button>
				</section>

				<section class="section-block">
					<div class="fee-table">
						<div class="fee-row header-row">
							<span>From</span>
							<span>To</span>
							<span>Fee</span>
							<span></span>
						</div>
						{#each feeRules as rule (rule.id)}
							<div class="fee-row">
								<label>
									<span class="sr-only">Minimum amount</span>
									<input type="number" min="1" step="1" bind:value={rule.min} />
								</label>
								<label>
									<span class="sr-only">Maximum amount</span>
									<input type="number" min={rule.min} step="1" bind:value={rule.max} />
								</label>
								<label>
									<span class="sr-only">Fee amount</span>
									<input type="number" min="0" step="1" bind:value={rule.fee} />
								</label>
								<button
									class="icon-button"
									type="button"
									aria-label="Remove pricing tier"
									title="Remove pricing tier"
									onclick={() => removeFeeTier(rule.id)}
								>
									×
								</button>
							</div>
						{/each}
					</div>
					<div class="action-row">
						<button class="secondary-action" type="button" onclick={sortFeeTiers}>Sort</button>
						<button
							class="primary-action"
							type="button"
							onclick={() => (activeView = 'transaction')}
						>
							Test Fee
						</button>
					</div>
				</section>
			{:else if activeView === 'reports'}
				<section class="view-header" aria-labelledby="reports-title">
					<div>
						<p class="eyebrow">Owner View</p>
						<h2 id="reports-title">Reports</h2>
					</div>
				</section>

				<section class="metric-grid compact-metrics" aria-label="Weekly report">
					<article class="metric-card profit">
						<p>Weekly Kita</p>
						<strong>{money.format(weekProfit)}</strong>
						<span>{weekTransactions.length} transactions</span>
					</article>
					<article class="metric-card cash">
						<p>Cash In Count</p>
						<strong
							>{numberFormat.format(
								weekTransactions.filter((item) => item.type === 'cash-in').length
							)}</strong
						>
					</article>
					<article class="metric-card gcash">
						<p>Cash Out Count</p>
						<strong
							>{numberFormat.format(
								weekTransactions.filter((item) => item.type === 'cash-out').length
							)}</strong
						>
					</article>
				</section>

				<section class="section-block">
					<div class="section-title">
						<h3>Daily Summary</h3>
						<span>Last 7 days</span>
					</div>
					<div class="report-list">
						{#each Array.from( { length: 7 }, (_, index) => addDays(todayStart, -index) ) as day (day.toDateString())}
							{@const dayTransactions = transactions.filter((transaction) =>
								isSameDay(transaction.createdAt, day)
							)}
							<div class="report-row">
								<span>{dateFormat.format(day)}</span>
								<strong>{money.format(totalFee(dayTransactions))}</strong>
								<span>{dayTransactions.length} tx</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</main>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		background:
			linear-gradient(180deg, rgba(236, 253, 245, 0.72), rgba(255, 255, 255, 0) 21rem), #f7faf9;
		color: #17231f;
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
	}

	:global(*) {
		box-sizing: border-box;
	}

	button,
	input {
		font: inherit;
	}

	button {
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.52;
	}

	.login-shell,
	.app-shell {
		min-height: 100svh;
	}

	.login-shell {
		display: grid;
		place-items: center;
		padding: 1rem;
	}

	.login-panel {
		width: min(100%, 24rem);
		border: 1px solid #d7e2dd;
		border-radius: 8px;
		background: #ffffff;
		padding: 1rem;
		box-shadow: 0 1.25rem 3rem rgba(23, 35, 31, 0.08);
	}

	.app-shell {
		width: min(100%, 68rem);
		margin: 0 auto;
		padding: 0.875rem 0.875rem 6rem;
	}

	.topbar,
	.view-header,
	.section-title,
	.action-row,
	.brand-lockup,
	.operator-pill {
		display: flex;
		align-items: center;
	}

	.topbar,
	.view-header,
	.section-title,
	.action-row {
		justify-content: space-between;
		gap: 1rem;
	}

	.topbar {
		padding: 0.75rem 0 1rem;
	}

	.brand-lockup {
		gap: 0.75rem;
		min-width: 0;
	}

	.brand-mark {
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 8px;
		background: #076b4d;
		color: #ffffff;
		font-size: 1.35rem;
		font-weight: 800;
	}

	.eyebrow {
		margin: 0 0 0.125rem;
		color: #586a64;
		font-size: 0.76rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	h1 {
		font-size: 1.35rem;
		line-height: 1.1;
	}

	h2 {
		font-size: 1.45rem;
		line-height: 1.15;
	}

	h3 {
		font-size: 1rem;
		line-height: 1.2;
	}

	.operator-pill {
		min-width: 0;
		border: 1px solid #d7e2dd;
		border-radius: 8px;
		background: #ffffff;
		padding: 0.25rem;
		color: #31443e;
	}

	.operator-pill span {
		max-width: 8rem;
		overflow: hidden;
		padding: 0 0.625rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.operator-pill button,
	.section-title button {
		border: 0;
		border-radius: 6px;
		background: #e7f6ef;
		color: #075f45;
		font-weight: 700;
		padding: 0.45rem 0.625rem;
	}

	.view-tabs {
		position: sticky;
		top: 0;
		z-index: 2;
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 0.35rem;
		margin: 0 -0.25rem 1rem;
		padding: 0.25rem;
		border: 1px solid #d7e2dd;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(0.5rem);
	}

	.view-tabs button,
	.segmented-control button {
		min-height: 2.75rem;
		border: 0;
		border-radius: 6px;
		background: transparent;
		color: #50635d;
		font-weight: 800;
	}

	.view-tabs button.active,
	.segmented-control button.active {
		background: #076b4d;
		color: #ffffff;
	}

	.tab-short {
		display: none;
	}

	.workspace {
		display: grid;
		gap: 1rem;
	}

	.metric-grid,
	.split-layout,
	.form-grid,
	.preview-grid {
		display: grid;
		gap: 0.75rem;
	}

	.metric-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.metric-card,
	.section-block,
	.entry-form,
	.login-panel {
		border: 1px solid #d7e2dd;
		border-radius: 8px;
		background: #ffffff;
	}

	.metric-card {
		display: grid;
		min-height: 8rem;
		align-content: space-between;
		gap: 0.75rem;
		padding: 0.9rem;
	}

	.metric-card p,
	.metric-card span,
	.transaction-row span,
	.preview-grid span,
	.two-stat-row span,
	.report-row span,
	label span,
	.rule-list p {
		color: #61736e;
		font-size: 0.86rem;
	}

	.metric-card strong {
		overflow-wrap: anywhere;
		font-size: 1.35rem;
		line-height: 1.15;
	}

	.metric-card.cash {
		border-top: 0.25rem solid #1f8a64;
	}

	.metric-card.gcash {
		border-top: 0.25rem solid #2874a6;
	}

	.metric-card.profit {
		border-top: 0.25rem solid #b7791f;
	}

	.split-layout {
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}

	.section-block,
	.entry-form {
		display: grid;
		gap: 1rem;
		padding: 0.9rem;
	}

	.section-title {
		padding-bottom: 0.25rem;
	}

	.section-title > span {
		color: #61736e;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.two-stat-row,
	.preview-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.two-stat-row {
		display: grid;
		gap: 0.75rem;
	}

	.two-stat-row div,
	.preview-grid div {
		display: grid;
		gap: 0.25rem;
		border: 1px solid #e3ebe8;
		border-radius: 8px;
		padding: 0.8rem;
	}

	.two-stat-row strong,
	.preview-grid strong {
		overflow-wrap: anywhere;
		font-size: 1.35rem;
	}

	.rule-list {
		display: grid;
		gap: 0.5rem;
	}

	.rule-list p {
		border-left: 0.25rem solid #1f8a64;
		padding-left: 0.625rem;
	}

	.rule-list p.warning {
		border-color: #b7791f;
		color: #8a4b12;
		font-weight: 800;
	}

	.transaction-list,
	.report-list,
	.pin-form {
		display: grid;
		gap: 0.65rem;
	}

	.transaction-row,
	.report-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: center;
		border: 1px solid #e3ebe8;
		border-radius: 8px;
		padding: 0.8rem;
	}

	.transaction-row > div {
		display: grid;
		min-width: 0;
		gap: 0.25rem;
	}

	.transaction-row > div:last-child {
		text-align: right;
	}

	.transaction-row strong,
	.transaction-row span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.entry-form {
		align-content: start;
	}

	.segmented-control {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.35rem;
		border: 1px solid #d7e2dd;
		border-radius: 8px;
		background: #f3f8f6;
		padding: 0.25rem;
	}

	.form-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	label {
		display: grid;
		gap: 0.35rem;
		font-weight: 800;
	}

	input {
		width: 100%;
		min-height: 3rem;
		border: 1px solid #cfdcd7;
		border-radius: 8px;
		background: #ffffff;
		color: #17231f;
		padding: 0.75rem;
	}

	input:focus,
	button:focus-visible {
		outline: 3px solid rgba(31, 138, 100, 0.25);
		outline-offset: 2px;
	}

	input[readonly] {
		background: #f3f8f6;
		color: #31443e;
	}

	.full-span {
		grid-column: 1 / -1;
	}

	.bad-diff {
		color: #a33a22;
	}

	.action-row {
		align-items: stretch;
	}

	.primary-action,
	.secondary-action {
		min-height: 3rem;
		border-radius: 8px;
		font-weight: 900;
		padding: 0.75rem 1rem;
	}

	.primary-action {
		border: 1px solid #076b4d;
		background: #076b4d;
		color: #ffffff;
	}

	.secondary-action {
		border: 1px solid #cfdcd7;
		background: #ffffff;
		color: #31443e;
	}

	.compact {
		min-height: 2.5rem;
		padding: 0.55rem 0.85rem;
	}

	.form-error {
		color: #a33a22;
		font-size: 0.9rem;
		font-weight: 800;
	}

	.fee-table {
		display: grid;
		gap: 0.5rem;
		overflow-x: auto;
	}

	.fee-row {
		display: grid;
		grid-template-columns: minmax(5rem, 1fr) minmax(5rem, 1fr) minmax(5rem, 1fr) 2.75rem;
		gap: 0.45rem;
		align-items: end;
		min-width: 23rem;
	}

	.header-row {
		align-items: center;
		color: #61736e;
		font-size: 0.8rem;
		font-weight: 900;
		text-transform: uppercase;
	}

	.icon-button {
		width: 2.75rem;
		height: 3rem;
		border: 1px solid #e1c3bd;
		border-radius: 8px;
		background: #fff7f5;
		color: #a33a22;
		font-size: 1.35rem;
		font-weight: 900;
	}

	.report-row {
		grid-template-columns: minmax(0, 1fr) auto auto;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	@media (max-width: 720px) {
		.app-shell {
			padding: 0.75rem 0.75rem 5.25rem;
		}

		.topbar {
			align-items: flex-start;
		}

		.operator-pill span {
			display: none;
		}

		.view-tabs {
			position: fixed;
			right: 0.75rem;
			bottom: 0.75rem;
			left: 0.75rem;
			top: auto;
			margin: 0;
			box-shadow: 0 0.75rem 2rem rgba(23, 35, 31, 0.2);
		}

		.tab-label {
			display: none;
		}

		.tab-short {
			display: inline;
		}

		.metric-grid,
		.split-layout,
		.form-grid {
			grid-template-columns: 1fr;
		}

		.compact-metrics {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.compact-metrics .metric-card {
			min-height: 7rem;
			padding: 0.75rem;
		}

		.compact-metrics .metric-card strong {
			font-size: 1rem;
		}
	}

	@media (max-width: 430px) {
		.app-shell {
			padding-inline: 0.55rem;
		}

		.view-tabs {
			right: 0.55rem;
			left: 0.55rem;
		}

		.metric-card strong,
		.two-stat-row strong,
		.preview-grid strong {
			font-size: 1.08rem;
		}

		.transaction-row {
			grid-template-columns: 1fr;
		}

		.transaction-row > div:last-child {
			text-align: left;
		}

		.preview-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
