# Supplied Template Assessment

The supplied `E-store2-main` archive is a React Native / Expo luxury-fashion sample rather than a web automotive storefront. Its useful functional ideas are limited to generic e-commerce patterns: searchable product browsing, category filtering, product detail, cart persistence, clear loading/error states, and an API-backed catalogue.

The implementation, brand identity, product names, fashion copy, imagery, source code, and visual assets will not be reused. Zalim-Marketing will retain its existing original web stack and be developed as an automotive client-demo storefront using original brand names, product descriptions, category naming, visual media already licensed for this project, and original layouts.

The connected Render MCP is enabled but currently returns an authorization-required state and cannot enumerate its capabilities. Render backend work will remain an explicit integration phase once the connection is re-authorized.

## Render Deployment Reference

Render supports a repository-root `render.yaml` Blueprint that describes a web service and its environment variables. A Node / Express service can use its own package build and start commands. Secret values must not be committed: Blueprint entries can use `sync: false` to prompt for configuration in Render, while server-generated secrets can use `generateValue: true`.

Sources consulted on 22 August 2026:

- [Render Blueprint YAML Reference](https://render.com/docs/blueprint-spec)
- [Deploy a Node Express App on Render](https://render.com/docs/deploy-node-express-app)
- [Render Environment Variables and Secrets](https://render.com/docs/configure-environment-variables)

The repository now includes a portable `render.yaml` Blueprint and `/health` endpoint. The Blueprint declares the Node web-service build and start commands, requests external values through `sync: false`, and lets Render generate the session secret. The production deployment requires externally managed values for the existing database, authentication, storage, and analytics integrations; no secret has been committed to the repository. The configuration follows the official Render Blueprint specification, which supports `healthCheckPath`, generated secrets, and dashboard-supplied values.[1]

## Render Postgres Migration Constraint

The authenticated Render integration created the `zalim-marketing-demo-db` Postgres 18 instance in Singapore and verified it as available. Its supported API can provision and inspect Postgres resources and run read-only database queries, but it does not return a connection string or provide schema-write operations. The connected browser did not return the Render dashboard session. The Postgres code migration can proceed locally, but applying generated schema SQL and attaching `DATABASE_URL` to the live service requires dashboard access or a supported secure connection-string handoff.

Render’s official Postgres guidance specifies a dedicated connection-information API endpoint at `GET /v1/postgres/{postgresId}/connection-info` with bearer authentication. It also states that a web service and Postgres instance in the same region should use the internal database URL to reduce latency. The current database and planned service are both configured for Singapore. [2]

## Live Service Configuration Note

The Render API also supports `PATCH /v1/services/{serviceId}` for updating an existing web service. Build logs from the first live deployment confirmed that a service retains the build command supplied at creation time; changing the repository `render.yaml` alone does not modify that already-created service. The service needs its build sequence updated to run `pnpm db:migrate && pnpm db:seed`, then redeployed. This seed is idempotent and is required to populate the live Postgres database with the original automotive catalogue.

## Live Validation

The GitHub-connected Render service is live at [zalim-marketing-demo.onrender.com](https://zalim-marketing-demo.onrender.com). Its `/health` endpoint returns `{"status":"ok"}`, and the public catalogue procedure reports 82 products. A live catalogue record was returned with its linked original brand and category, confirming that the Render Postgres migration and seed are active. The public homepage also rendered the original Zalim-Marketing automotive demo, 82-product catalogue message, UK/US/Australia vehicle context, department links, touring route, and direct enquiry guidance.

## References

[1]: https://render.com/docs/blueprint-spec "Render Blueprint YAML Reference"
[2]: https://render.com/docs/postgresql-creating-connecting "Create and Connect to Render Postgres"
