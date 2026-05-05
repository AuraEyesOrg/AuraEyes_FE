# Project Guidelines

## Code Style

- Use React 19 functional components and hooks only.
- Keep strict TypeScript typing. Avoid `any`; prefer `interface` for object contracts.
- Prefer named exports for components and feature modules.
- Use Tailwind CSS v4 first; use SASS only for complex legacy overrides.
- Use `@tanstack/react-query` for server data and `zustand` for global client state.
- Use `react-hook-form` with `yup` schemas defined outside component bodies.
- Use `@` path alias for imports from `src`.

## Architecture

- Provider composition lives in `src/provider.tsx` (i18n, auth locale, query client, theme, SignalR).
- Route graph is centralized in `src/routes/index.tsx` with role-based and locale-aware guards.
- Keep API access in `src/lib/api.ts` and auth/refresh behavior in `src/lib/interceptors.ts`.
- Follow feature-sliced boundaries under `src/features/*`.

## Build and Test

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build` (runs `prebuild` to generate i18n types)
- Unit/component tests: `npm run test`
- E2E tests: `npm run test:e2e` (requires setup in docs)
- Lint/format: `npm run lint`, `npm run lint:fix`, `npm run format`

## Conventions

- Locale-first routing is required. Keep `/:locale/*` paths consistent with route guards and navigation helpers.
- Default locale is Vietnamese (`vi`). Keep locale behavior aligned in i18n and language store logic.
- Keep new ophthalmologist translations in `Ophthalmologist.*` namespaces for both `vi` and `en` locale files.
- `PrivateRoute` wrappers must pass a `ReactElement` child, not a `ReactNode`.
- Regenerate translation typings when locale keys change: `npm run i18n:types`.

## Docs

- Overview and setup: [../README.md](../README.md)
- Router intent and layout notes: [../ROUTES_README.md](../ROUTES_README.md)
- Structure map and selectors: [../PROJECT_STRUCTURE_MAP.md](../PROJECT_STRUCTURE_MAP.md)
- E2E prerequisites and env setup: [../docs/E2E_PLAYWRIGHT_EXECUTION_GUIDE.md](../docs/E2E_PLAYWRIGHT_EXECUTION_GUIDE.md)
- E2E flow coverage: [../tests/e2e/e2e-flows.md](../tests/e2e/e2e-flows.md)

## Pitfalls

- `README.md` contains some legacy scripts that do not match current `package.json`; trust `package.json` scripts.
- Playwright config uses port `3001` in test mode, while some docs mention `3000`.
- Runtime env mostly uses `VITE_API_END_POINT`; avoid mixing it with `VITE_API_ENDPOINT`.
- Jest is the active unit test runner even though Vite config includes a `test` section.
