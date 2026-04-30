<script lang="ts" module>
	export type LoginPayload = {
		mobileNumber: string;
		pin: string;
	};
</script>

<script lang="ts">
	import { tick } from 'svelte';
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
	const helperId = `${fieldId}-helper`;
	const mobileHelpId = `${fieldId}-mobile-help`;
	const pinHelpId = `${fieldId}-pin-help`;
	const maxPinLength = 6;
	const maxMobileNumberLength = 12;
	const pinSlots = Array.from({ length: maxPinLength }, (_, index) => index);

	let mobileNumber = $state('');
	let pin = $state('');
	let errorMessage = $state('');
	let mobileInput = $state<HTMLInputElement | null>(null);
	let pinInput = $state<HTMLInputElement | null>(null);

	let normalizedMobile = $derived(mobileNumber.replace(/\D/g, ''));
	let isMobileValid = $derived(/^(09\d{9}|639\d{9})$/.test(normalizedMobile));
	let isPinComplete = $derived(/^\d{6}$/.test(pin));
	let canSubmit = $derived(isMobileValid && isPinComplete);
	let helperText = $derived(getHelperText());

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!canSubmit) {
			errorMessage = !isMobileValid
				? 'I-check ang mobile number. Dapat 09XXXXXXXXX.'
				: 'Kulang pa ang 6-digit PIN.';
			focusFirstInvalidField();
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

	function handleMobileInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const nextValue = input.value.replace(/\D/g, '').slice(0, maxMobileNumberLength);

		input.value = nextValue;
		mobileNumber = nextValue;
	}

	function handlePinInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const nextValue = input.value.replace(/\D/g, '').slice(0, maxPinLength);

		input.value = nextValue;
		pin = nextValue;
	}

	async function focusFirstInvalidField() {
		await tick();

		if (!isMobileValid) {
			mobileInput?.focus();
			return;
		}

		pinInput?.focus();
	}

	function getHelperText() {
		if (!mobileNumber && !pin) {
			return 'Mobile number at PIN lang. Mabilis lang ito.';
		}

		if (!isMobileValid) {
			return 'Gamitin ang 09XXXXXXXXX na mobile number.';
		}

		if (!isPinComplete) {
			return `${maxPinLength - pin.length} digit pa sa PIN.`;
		}

		return 'Ayos. Pwede nang mag-login.';
	}
</script>

<Card.Root class="border-border/80 bg-card shadow-sm">
	<Card.Header class="gap-2">
		<Card.Title class="text-xl">Pasok sa account</Card.Title>
		<Card.Description id={helperId} class="text-base leading-6">{helperText}</Card.Description>
	</Card.Header>

	<Card.Content>
		<form class="grid gap-5" onsubmit={handleSubmit}>
			<div class="grid gap-2">
				<Label for={mobileId}>Mobile number</Label>
				<p id={mobileHelpId} class="text-sm leading-5 text-muted-foreground">
					Gamitin ang registered number ng tindahan.
				</p>
				<Input
					id={mobileId}
					name="mobileNumber"
					type="tel"
					inputmode="numeric"
					autocomplete="tel-national"
					placeholder="09XXXXXXXXX"
					aria-describedby={errorMessage
						? `${mobileHelpId} ${helperId} ${errorId}`
						: `${mobileHelpId} ${helperId}`}
					aria-invalid={errorMessage && !isMobileValid ? 'true' : undefined}
					class="h-12 text-base"
					bind:value={mobileNumber}
					bind:ref={mobileInput}
					oninput={handleMobileInput}
				/>
			</div>

			<div class="grid gap-3">
				<div class="grid gap-2">
					<Label for={pinId}>6-digit PIN</Label>
					<p id={pinHelpId} class="text-sm leading-5 text-muted-foreground">
						Numbers only. Hindi lalabas ang PIN habang tina-type.
					</p>
					<Input
						id={pinId}
						name="pin"
						type="password"
						inputmode="numeric"
						autocomplete="current-password"
						pattern="[0-9]*"
						aria-describedby={errorMessage
							? `${pinHelpId} ${helperId} ${errorId}`
							: `${pinHelpId} ${helperId}`}
						aria-invalid={errorMessage && isMobileValid && !isPinComplete ? 'true' : undefined}
						class="h-12 text-base tracking-[0.35em]"
						bind:value={pin}
						bind:ref={pinInput}
						oninput={handlePinInput}
					/>
				</div>

				<div class="grid grid-cols-6 gap-1.5" aria-hidden="true">
					{#each pinSlots as index (index)}
						<div
							class={index < pin.length
								? 'h-2 rounded-full bg-primary transition-colors'
								: 'h-2 rounded-full bg-muted transition-colors'}
						></div>
					{/each}
				</div>
			</div>

			{#if errorMessage}
				<p
					id={errorId}
					class="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
				>
					{errorMessage}
				</p>
			{/if}

			<Button
				type="submit"
				size="lg"
				class="h-12 w-full text-base"
				disabled={isLoading || !canSubmit}
				aria-describedby={helperId}
			>
				{isLoading ? 'Checking...' : 'Login na'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
