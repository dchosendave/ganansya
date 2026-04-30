<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';

	type Props = {
		eyebrow?: string;
		title: string;
		description: string;
	};

	let { eyebrow = 'Ganansya', title, description }: Props = $props();
</script>

<svelte:head>
	<title>{title} | Ganansya</title>
	<meta name="description" content={description} />
</svelte:head>

<main class="min-h-svh bg-background px-4 py-5 text-foreground sm:px-6 sm:py-8">
	<section class="mx-auto flex w-full max-w-sm flex-col gap-5">
		<div class="space-y-2">
			<p class="text-sm font-semibold text-muted-foreground">{eyebrow}</p>
			<h1 class="text-3xl leading-tight font-semibold tracking-normal">{title}</h1>
			<p class="max-w-[34ch] text-sm leading-6 text-muted-foreground">{description}</p>
		</div>

		<div class="rounded-[2rem] border border-border/80 bg-card px-4 py-4 shadow-sm">
			<p class="text-sm leading-6 text-muted-foreground">
				Naka-ready na ang route na ito para sa susunod na feature slice.
			</p>

			<div class="mt-4 flex flex-wrap gap-3">
				<Button href="/home" size="lg" class="h-11">Balik sa home</Button>
			</div>
		</div>
	</section>
</main>
