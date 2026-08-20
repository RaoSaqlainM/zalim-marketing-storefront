# Motion and Discovery Validation

**Validation date:** 20 August 2026  
**Scope:** Zalim-Marketing public storefront motion, vehicle discovery, responsive behavior, and product-media availability.

## Route evidence

| Route | Responsive evidence | Confirmed behavior |
|---|---|---|
| `/` | 390 × 844 viewport capture, full-page review | The hero’s gold and blue particle atmosphere is visible behind the primary message without obscuring copy or actions. The page retains its full section hierarchy and responsive navigation. The home route contains the intentional hero, vehicle-wayfinder, and touring particle scenes. |
| `/vehicle-finder` | 390 × 844 viewport capture, full-page review | The market controls, make/model/year inputs, fitment prompt, and Save & open matched catalogue control remain vertically legible and touch-accessible. The saved-profile card is designed to restore, clear, and reuse a valid browser profile. |
| `/shop` | 390 × 844 viewport capture, full-page review | The catalogue guide, filters, responsive product grid, product cards, and enquiry-first footer remain usable at mobile width. Product cards retain a branded visual fallback while native lazy-loaded media approaches the viewport. |

## Motion and accessibility audit

| Area | Safeguard | Evidence |
|---|---|---|
| Scroll reveals | One `IntersectionObserver` targets route sections and unobserves each section after its first entry. | The reveal setup uses an 8% threshold, a small negative bottom margin, a short maximum three-step delay, and no repeated observer work after a section becomes visible. |
| Scroll indicator | Updates are coalesced with `requestAnimationFrame`; the scroll listener is passive; the fill changes through `transform: scaleX()`. | No layout-driven width changes are used during scroll progress updates. Resize and scroll listeners are removed during component cleanup. |
| Particle scenes | Particle treatment is limited to selected home scenes and is rendered through non-interactive pseudo-elements. | The overlay does not receive pointer input; content remains above it through explicit stacking order. The animated atmosphere is opt-in and limited to the dedicated hero, wayfinder, and touring treatments. |
| Reduced motion | Motion is only enabled inside `prefers-reduced-motion: no-preference`. The reduced-motion block makes reveals immediately visible, hides the progress bar, disables smooth scrolling, and reduces animations/transitions to a single near-instant frame. | Visitors who prefer reduced motion are never left with hidden reveal content or continuously animated particles. |
| Mobile interaction | Touch feedback is immediate through a short active-scale state; header controls are 40 px square and primary vehicle actions are 48 px high. | The mobile captures show no horizontal overflow, clipped primary controls, or text/particle contrast conflicts. |

## Saved vehicle regression coverage

The saved vehicle profile is stored under `zalim-market:vehicle-profile`. It accepts only a supported UK, US, or Australian market combined with string make, model, and year fields. The added regression suite confirms a valid Australian Ford Ranger profile is recovered and malformed JSON, unsupported markets, and invalid field types are rejected safely.

## Product-media availability

All ten uploaded product-image groups were requested through their public storefront paths with redirects followed. Each returned **HTTP 200**. The catalogue continues to use `loading="lazy"` and `decoding="async"`; the full-page capture utility may retain the deliberate card fallback for off-screen native lazy images, but no blank visual state is presented while an image has not yet loaded or fails.

## Validation result

TypeScript completed without errors. The configured Vitest suite completed with **6 passing files and 33 passing tests**. This audit confirms the implementation safeguards and responsive presentation; it does not claim a device-specific frame-rate measurement.
