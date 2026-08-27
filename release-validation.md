# Release Validation Notes

## Visual identity

The original image-backed Zalim-Marketing mark was reviewed in the desktop and mobile storefront headers on 2026-08-27. The compact symbol and wordmark remain legible on the light navigation surface, and the responsive header retains usable spacing at a 390px viewport.

## Vercel deployment sources

Vercel’s Vite guide documents a root `vercel.json` rewrite for SPA deep links. Vercel Functions are request-driven server-side handlers, so the application must export a handler and must not start a persistent HTTP listener during function import. The project configuration guide documents `buildCommand`, `outputDirectory`, rewrites, and function configuration as version-controlled project settings.

1. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
2. [Vercel Functions](https://vercel.com/docs/functions)
3. [Rewrites on Vercel](https://vercel.com/docs/routing/rewrites)
4. [Vercel project configuration](https://vercel.com/docs/project-configuration)

## Vercel readiness validation

The Vite client build completed successfully with the configured `pnpm build:client` command on 2026-08-27. The dedicated application-entry regression test confirms that the Express app can be imported without opening a listener, that `/health` and `/api/health` return the expected status payload, and that SPA rewrites exclude `/api` paths.

The Vercel CLI was available for local validation, but its account token was invalid, so `vercel build` could not access account-scoped configuration. No Vercel project was linked, created, or deployed. The repository remains prepared for dashboard import and authenticated Vercel validation by its owner.

## Release validation

On 2026-08-27, `pnpm check`, `pnpm test`, and `pnpm build` each completed successfully. The suite contains 19 passing test files and 69 passing tests, including regression coverage for the Vercel Express application export and health routes. The local `/health` endpoint returned `{ "status": "ok" }` after the release refactor.

Desktop and mobile full-page visual reviews covered the home page, catalogue, and browser-local checkout entry. The image-backed Zalim-Marketing mark remains readable in the desktop and mobile headers and in the footer. The catalogue completed its development-only proxy load with successful API responses, and the final browser-console and post-restart server-log review found no new runtime errors.
