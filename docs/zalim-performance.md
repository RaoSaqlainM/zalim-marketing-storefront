# Zalim Marketing performance notes

## Public media strategy

The home hero is the only eager, high-priority image because it is above the fold. Category, promotional, catalog, cart, checkout, search-suggestion, and product-gallery thumbnail media uses native `loading="lazy"` and `decoding="async"` where it is non-critical. Product cards reserve a stable aspect ratio and use the `lazy-media` utility with `content-visibility: auto` and an intrinsic placeholder size to avoid layout shifts while deferred images load.

The product-image endpoints are served by the managed media layer as `image/webp`. The five initial product assets resolve between approximately 129 KB and 351 KB after delivery. The responsive grid and fixed image aspect ratios let the browser choose an appropriately sized layout without a separate animation or JavaScript image-loader workload.

## Motion and accessibility

Public navigation uses a short opacity-and-translate route-enter treatment and a transform-only scroll-progress indicator. The app does not intercept scroll position or use scroll-jacking. Smooth scrolling is enabled only when the operating system allows motion, while the reduced-motion media query removes animations, transitions, and the loading overlay.

## Verification

The revised homepage, vehicle finder, catalog, cart, checkout, account, order, protected administration, and empty-state routes were checked at desktop and mobile layouts. Type checking and the Vitest suite pass after the rebrand and page-by-page changes.
