# Product-page reference notes

The public product page supplied by the user was reviewed only for general commerce interaction ideas. The original Zalim-Marketing design may use a clear product gallery, quantity choice, distinct purchase actions, and visible fulfilment context, but must not reuse the reference site's branding, written content, visual identity, policies, imagery, or implementation.

The completed desktop and mobile verification confirms the workshop panel now displays the uploaded original automotive visual, the transition from Popular picks to Garage Check has no blank gap, and the changed product card, oil shelf, checkout, and purchase-control text remains readable against its background. A compact reduced-motion-safe automatic oil-discovery strip supports movement without adding layout shift.

## Vercel deployment notes

Official Vercel documentation was consulted on August 27, 2026. The configuration must use the repository build command and output directory, provide a SPA rewrite for client-side routes, and expose the Express server as a Vercel Function rather than depend on a long-running listener. Environment values must be created in Vercel Project Settings and must never be committed. Sources: https://vercel.com/docs/frameworks/frontend/vite, https://vercel.com/docs/frameworks/backend/express, and https://vercel.com/docs/project-configuration.
