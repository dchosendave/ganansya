<script lang="ts">
	import type { LayoutProps } from './$types';

	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	const flashToneClasses = {
		info: 'border-border/80 bg-card text-foreground',
		success: 'border-primary/15 bg-primary/6 text-foreground',
		error: 'border-destructive/20 bg-destructive/10 text-destructive'
	} as const;

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if data.flashMessage}
	<div class="pointer-events-none fixed inset-x-0 top-4 z-50 px-4">
		<p
			class={[
				'mx-auto max-w-xl rounded-3xl border px-4 py-3 text-sm font-medium shadow-sm backdrop-blur',
				flashToneClasses[data.flashMessage.tone]
			]}
			role="status"
			aria-live="polite"
		>
			{data.flashMessage.text}
		</p>
	</div>
{/if}

{@render children()}
