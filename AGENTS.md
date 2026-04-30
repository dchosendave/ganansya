# Repository Guidelines

## Project Structure & Module Organization

This repository is a SvelteKit application configured with TypeScript, Vite, Tailwind CSS, and the Vercel adapter. Application code lives under `src/`. Route files are in `src/routes/`, with `+layout.svelte` importing global styles from `src/routes/layout.css` and `+page.svelte` serving the current home page. Shared library exports belong in `src/lib/index.ts`; reusable assets belong in `src/lib/assets/`. Static public files go in `static/`. Product notes and planning documents are kept in `docs/`, currently `docs/product-requirement-document.md`. The `database/` directory exists for future data/schema work.

## Build, Test, and Development Commands

Use npm scripts from the repository root:

- `npm run dev`: start the local Vite development server.
- `npm run build`: create a production build.
- `npm run preview`: preview the production build locally after building.
- `npm run check`: run SvelteKit sync and TypeScript/Svelte diagnostics.
- `npm run check:watch`: run diagnostics continuously during development.
- `npm run lint`: check formatting with Prettier.
- `npm run format`: apply Prettier formatting.

## Coding Style & Naming Conventions

Follow the existing Prettier configuration: tabs for indentation, single quotes, no trailing commas, and a 100-character print width. Svelte files should use the `.svelte` extension and TypeScript scripts should use `lang="ts"`. Prefer SvelteKit naming conventions for route modules such as `+page.svelte`, `+layout.svelte`, and future `+page.server.ts` files. Keep reusable helpers in `src/lib/` and import them through `$lib` when appropriate.

## Testing Guidelines

No dedicated unit or end-to-end test framework is configured yet. Before submitting changes, run `npm run check`, `npm run lint`, and `npm run build`. If tests are added later, place them near the code they cover or in a clear test directory, use descriptive names such as `feature-name.test.ts`, and document the new command in `package.json` and this guide.

## Commit & Pull Request Guidelines

The current Git history contains only an initial informal commit, so there is no established convention. Use short, imperative commit messages such as `Add landing page layout` or `Fix Svelte diagnostics`. Pull requests should include a concise summary, testing notes with the commands run, linked issues when relevant, and screenshots for visible UI changes.

## Security & Configuration Tips

Do not commit secrets, local environment files, or generated build output. Keep dependency changes reflected in both `package.json` and `package-lock.json`.
