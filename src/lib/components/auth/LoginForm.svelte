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
	const maxMobileNumberLength = 11;

	let mobileNumber = $state('');
	let pin = $state('');
	let errorMessage = $state('');

	let normalizedMobile = $derived(mobileNumber.replace(/\D/g, ''));
	let isMobileValid = $derived(/^(09\d{9}|639\d{9})$/.test(normalizedMobile));
	let isPinComplete = $derived(/^\d{6}$/.test(pin));
	let canSubmit = $derived(isMobileValid && isPinComplete);
	let helperText = $derived(getHelperText());

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!canSubmit) {
			errorMessage = 'Check natin ulit ang mobile number at 6-digit PIN.';
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

	function getHelperText() {
		if (!mobileNumber && !pin) {
			return 'Mobile number at PIN lang. Bilis lang ito.';
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
	<Card.Header class="gap-1">
		<Card.Title class="text-xl">Pasok sa account</Card.Title>
		<Card.Description>{helperText}</Card.Description>
	</Card.Header>

	<Card.Content>
		<form class="grid gap-5" onsubmit={handleSubmit}>
			<div class="grid gap-2">
				<Label for={mobileId}>Mobile number</Label>
				<Input
					id={mobileId}
					name="mobileNumber"
					type="tel"
					inputmode="tel"
					autocomplete="tel"
					placeholder="09XXXXXXXXX"
					aria-describedby={errorMessage ? errorId : undefined}
					aria-invalid={errorMessage ? 'true' : undefined}
					class="h-12 text-base"
					bind:value={mobileNumber}
					maxlength={maxMobileNumberLength}
				/>
			</div>

			<div class="grid gap-3">
				<div class="grid gap-2">
					<Label for={pinId}>6-digit PIN</Label>
					<Input
						id={pinId}
						name="pin"
						type="password"
						inputmode="numeric"
						autocomplete="current-password"
						maxlength={maxPinLength}
						pattern="[0-9]*"
						aria-describedby={errorMessage ? errorId : undefined}
						aria-invalid={errorMessage ? 'true' : undefined}
						class="h-12 text-base tracking-[0.35em]"
						bind:value={pin}
						oninput={handlePinInput}
					/>
				</div>

				<div class="grid grid-cols-6 gap-1.5" aria-hidden="true">
					{#each Array.from({ length: maxPinLength }, (_, index) => index) as index (index)}
						<div
							class={index < pin.length
								? 'h-1.5 rounded-full bg-primary transition-colors'
								: 'h-1.5 rounded-full bg-muted transition-colors'}
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

			<Button type="submit" size="lg" class="h-12 w-full" disabled={isLoading || !canSubmit}>
				{isLoading ? 'Checking...' : 'Login na'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
