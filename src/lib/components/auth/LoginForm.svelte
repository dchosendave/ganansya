<script lang="ts" module>
	export type LoginPayload = {
		mobileNumber: string;
		pin: string;
	};
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	type Props = {
		onSubmit?: (payload: LoginPayload) => void;
		isLoading?: boolean;
	};

	let { onSubmit, isLoading = false }: Props = $props();

	const fieldId = $props.id();
	const mobileId = `${fieldId}-mobile`;
	const pinId = `${fieldId}-pin`;
	const errorId = `${fieldId}-error`;
    const maxPinLength = 6;

	let mobileNumber = $state('');
	let pin = $state('');
	let errorMessage = $state('');

	let normalizedMobile = $derived(mobileNumber.replace(/\D/g, ''));
	let canSubmit = $derived(/^(09\d{9}|639\d{9})$/.test(normalizedMobile) && /^\d{6}$/.test(pin));

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!canSubmit) {
			errorMessage = 'Enter a valid mobile number and 6-digit PIN.';
			return;
		}

		errorMessage = '';
		onSubmit?.({
			mobileNumber: normalizedMobile.startsWith('09')
				? `+63${normalizedMobile.slice(1)}`
				: `+${normalizedMobile}`,
			pin
		});
	}

	function handlePinInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		pin = input.value.replace(/\D/g, '').slice(0, maxPinLength);
	}
</script>

<Card.Root class="border-border/80 shadow-none">
	<Card.Header>
		<Card.Title class="text-xl">Login</Card.Title>
	</Card.Header>
	<Card.Content>
		<form class="grid gap-5" onsubmit={handleSubmit}>
			<div class="grid gap-2">
				<Label for={mobileId}>Mobile number</Label>
				<Input id={mobileId} name="mobileNumber" type="tel" placeholder="09XXXXXXXXX" bind:value={mobileNumber} />
			</div>

			<div class="grid gap-2">
				<Label for={pinId}>6-digit PIN</Label>
				<Input id={pinId} name="pin" type="password" inputmode="numeric" maxlength={maxPinLength} bind:value={pin} oninput={handlePinInput} />
			</div>

			{#if errorMessage}
				<p id={errorId} class="text-sm font-medium text-destructive">{errorMessage}</p>
			{/if}

			<Button type="submit" size="lg" class="w-full" disabled={isLoading || !canSubmit}>
				{isLoading ? 'Checking...' : 'Login'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
