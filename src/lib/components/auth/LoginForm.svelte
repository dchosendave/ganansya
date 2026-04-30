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
	let statusToneClass = $derived(
		canSubmit
			? 'border-primary/15 bg-primary/5 text-foreground'
			: 'border-border/80 bg-muted/35 text-muted-foreground'
	);
	let pinCountToneClass = $derived(
		pin.length === maxPinLength ? 'text-foreground' : 'text-muted-foreground'
	);
	let pinDotToneClass = $derived(
		pin.length > 0 ? 'text-primary/80' : 'text-muted-foreground/40'
	);

	function setMobileNumber(value: string) {
		mobileNumber = value.replace(/\D/g, '').slice(0, maxMobileNumberLength);
	}

	function setPin(value: string) {
		pin = value.replace(/\D/g, '').slice(0, maxPinLength);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!canSubmit) {
			errorMessage = !isMobileValid
				? 'I-check ang mobile number. Gamitin ang 09XXXXXXXXX o 639XXXXXXXXX.'
				: 'Ilagay ang buong 6-digit PIN.';
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
			return 'Mobile number at 6-digit PIN lang muna.';
		}

		if (!isMobileValid) {
			return 'I-check ang mobile format bago tumuloy.';
		}

		if (!isPinComplete) {
			return `Kulang pa ng ${maxPinLength - pin.length} digit sa PIN.`;
		}

		return 'Ayos. Pwede nang pumasok.';
	}
</script>

<Card.Root class="border-border/80 bg-card shadow-sm">
	<Card.Header class="gap-3">
		<Card.Title class="text-xl">Pasok sa account</Card.Title>
		<Card.Description id={helperId} class="max-w-[24ch] text-base leading-6">
			Gamitin ang mobile number at 6-digit PIN ng tindahan.
		</Card.Description>
	</Card.Header>

	<Card.Content>
		<form class="grid gap-5" onsubmit={handleSubmit}>
			<p
				class={[
					'rounded-2xl border px-3.5 py-3 text-sm leading-5 transition-colors',
					statusToneClass
				]}
				role="status"
				aria-live="polite"
			>
				{helperText}
			</p>

			<div class="grid gap-2.5">
				<div class="flex items-center justify-between gap-3">
					<Label for={mobileId}>Mobile number</Label>
					<span class="rounded-full bg-muted px-2.5 py-1 text-[0.72rem] font-semibold text-muted-foreground">
						09 or 639
					</span>
				</div>
				<p id={mobileHelpId} class="text-sm leading-5 text-muted-foreground">
					Pwede ang 09XXXXXXXXX o 639XXXXXXXXX.
				</p>
				<Input
					id={mobileId}
					name="mobileNumber"
					type="tel"
					inputmode="numeric"
					autocomplete="tel-national"
					enterkeyhint="next"
					maxlength={maxMobileNumberLength}
					spellcheck={false}
					placeholder="09XXXXXXXXX"
					aria-describedby={errorMessage
						? `${mobileHelpId} ${helperId} ${errorId}`
						: `${mobileHelpId} ${helperId}`}
					aria-invalid={errorMessage && !isMobileValid ? 'true' : undefined}
					class="h-12 border-border/90 bg-muted/20 px-4 text-base shadow-none placeholder:text-muted-foreground/80"
					bind:value={() => mobileNumber, setMobileNumber}
					bind:ref={mobileInput}
				/>
			</div>

			<div class="grid gap-3.5">
				<div class="grid gap-2.5">
					<div class="flex items-center justify-between gap-3">
						<Label for={pinId}>6-digit PIN</Label>
						<span
							class={[
								'rounded-full bg-muted px-2.5 py-1 text-[0.72rem] font-semibold transition-colors',
								pinCountToneClass
							]}
						>
							{pin.length}/{maxPinLength}
						</span>
					</div>
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
						enterkeyhint="go"
						maxlength={maxPinLength}
						aria-describedby={errorMessage
							? `${pinHelpId} ${helperId} ${errorId}`
							: `${pinHelpId} ${helperId}`}
						aria-invalid={errorMessage && isMobileValid && !isPinComplete ? 'true' : undefined}
						class="h-12 border-border/90 bg-muted/20 px-4 text-center text-base font-semibold tracking-[0.4em] shadow-none"
						bind:value={() => pin, setPin}
						bind:ref={pinInput}
					/>
				</div>

				<div class="grid grid-cols-6 gap-2" aria-hidden="true">
					{#each pinSlots as index (index)}
						<div
							class={[
								'grid h-11 place-items-center rounded-2xl border text-lg transition-colors',
								index < pin.length
									? 'border-primary/20 bg-primary/6'
									: 'border-border/80 bg-muted/20'
							]}
						>
							<span class={pinDotToneClass}>&bull;</span>
						</div>
					{/each}
				</div>
			</div>

			{#if errorMessage}
				<p
					id={errorId}
					class="rounded-2xl border border-destructive/15 bg-destructive/8 px-3.5 py-3 text-sm font-medium leading-5 text-destructive"
					role="alert"
				>
					{errorMessage}
				</p>
			{/if}

			<Button
				type="submit"
				size="lg"
				class="h-12 w-full text-base shadow-none"
				disabled={isLoading || !canSubmit}
				aria-describedby={helperId}
			>
				{isLoading ? 'Tine-check...' : 'Pumasok'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
