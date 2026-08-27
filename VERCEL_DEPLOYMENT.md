# Zalim-Marketing Vercel Deployment

## Release model

This repository builds the React storefront with Vite into `dist/public` and exposes the existing Express routes through Vercel Function entries in `api/`. `vercel.json` leaves `/api` requests available to the function files, forwards the health endpoint to `/api/health`, and sends other route requests to the Vite SPA entry. This is the configuration Vercel documents for Vite SPA deep links and exported Express applications.[1] [2]

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build:client` |
| Output directory | `dist/public` |
| Health endpoint | `/health` |
| API prefix | `/api` |

## Deployment procedure

Import the private GitHub repository in the [Vercel dashboard](https://vercel.com/new). Retain the repository root as the project root, accept the version-controlled build settings, add the required environment variables in Vercel Project Settings, and create a preview deployment before promoting a reviewed deployment. The Vercel CLI alternatives are `vercel` for a preview and `vercel --prod` for a production promotion.[2]

> The current checkout, confirmation, tracking, and delivery-route visuals are explicitly browser-local demonstrations. Do not configure payment-provider secrets or represent an order as live until a real provider, inventory workflow, privacy process, and fulfilment operation have been independently implemented and reviewed.

## Environment variables

| Variable | Requirement | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Required for database-backed catalogue and account routes | Postgres connection string available to the Vercel Function |
| `RENDER_DATABASE_URL` | Optional alternative to `DATABASE_URL` | Existing Postgres connection-string fallback |
| `JWT_SECRET` | Required when OAuth session routes are retained | Signs session cookies |
| `VITE_APP_ID` | Required when OAuth session routes are retained | Client OAuth application identifier |
| `OAUTH_SERVER_URL` | Required when OAuth session routes are retained | OAuth service base URL |
| `OWNER_OPEN_ID` | Required when OAuth session routes are retained | Store-owner identity used by the inherited access controls |
| `BUILT_IN_FORGE_API_URL` | Required while `/manus-storage` media paths are retained | Resolves existing image-storage redirects |
| `BUILT_IN_FORGE_API_KEY` | Required while `/manus-storage` media paths are retained | Authorizes the existing image-storage redirects |

Enter all values only through Vercel Project Settings. Do not commit `.env` files, database strings, API keys, or session secrets. Vite exposes only variables deliberately prefixed with `VITE_` to browser code, so server-only values must remain unprefixed.[1]

## Operational checks

After configuring the project, confirm `/health` returns `{ "status": "ok" }`, verify a catalogue page, direct-load a nested storefront route, and verify that `/api/trpc` reaches the function rather than the SPA fallback. The existing Render catalogue proxy is development-only and is not a replacement for a Vercel production database connection.

## References

[1] [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

[2] [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)

[3] [Vercel project configuration](https://vercel.com/docs/project-configuration)
