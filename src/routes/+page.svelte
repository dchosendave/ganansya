<script lang="ts">
	import { onMount } from 'svelte';

	let message = $state('Hello, SvelteKit!');
</script>

<h1>{message}</h1>


