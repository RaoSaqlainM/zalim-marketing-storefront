# Motion and Discovery Validation

**Validation date:** 20 August 2026  
**Scope:** Zalim-Marketing public storefront motion, vehicle discovery, responsive behavior, and product-media availability.

## Route evidence

| Route | Responsive evidence | Confirmed behavior |
|---|---|---|
| `/` | 1280 × 900 full-page review and 390 × 844 mobile viewport review | The hero’s gold and blue particle atmosphere remains visible behind the primary message without obscuring copy or actions. The selected hero and touring scenes now respond to mouse movement or a moving finger with a bounded gold/blue atmosphere shift; the page retains its full section hierarchy and responsive navigation. |
| `/vehicle-finder` | 390 × 844 viewport capture, full-page review | The market controls, make/model/year inputs, fitment prompt, and Save & open matched catalogue control remain vertically legible and touch-accessible. The saved-profile card is designed to restore, clear, and reuse a valid browser profile. |
| `/shop` | 390 × 844 viewport capture, full-page review | The catalogue guide, filters, responsive product grid, product cards, and enquiry-first footer remain usable at mobile width. Product cards retain a branded visual fallback while native lazy-loaded media approaches the viewport. |

## Motion and accessibility audit

| Area | Safeguard | Evidence |
|---|---|---|
| Scroll reveals | One `IntersectionObserver` targets route sections and unobserves each section after its first entry. | The reveal setup uses an 8% threshold, a small negative bottom margin, a short maximum three-step delay, and no repeated observer work after a section becomes visible. |
| Scroll indicator | Updates are coalesced with `requestAnimationFrame`; the scroll listener is passive; the fill changes through `transform: scaleX()`. | No layout-driven width changes are used during scroll progress updates. Resize and scroll listeners are removed during component cleanup. |
| Particle scenes | Particle treatment is limited to the selected homepage hero and touring scenes. | A passive pointer listener sends bounded focus data to a decorative, `pointer-events: none` interaction layer. It schedules no more than one animation-frame update per input frame, prevents no default browser behavior, and resets on leave, release, or cancellation. |
| Reduced motion | Motion is only enabled inside `prefers-reduced-motion: no-preference`. The pointer interaction setup returns immediately for `prefers-reduced-motion: reduce`; the CSS fallback makes reveals immediately visible, hides the progress bar, disables smooth scrolling, and reduces animations/transitions to a single near-instant frame. | Visitors who prefer reduced motion are never left with hidden reveal content, moving particle responses, or continuously animated particles. |
| Mobile interaction | Touch feedback is immediate through a short active-scale state; header controls are 40 px square and primary vehicle actions are 48 px high. | The mobile captures show no horizontal overflow, clipped primary controls, or text/particle contrast conflicts. |

## Direct interaction verification

A live Chromium check exercised both selected particle scenes. Desktop pointer movement set the hero focus to **82% / 20%** and the touring focus to **20% / 76%**. A mobile touch-style pointer event set the hero focus to **26% / 72%**. In the same check, the desktop and mobile marketplace links navigated successfully after interaction, confirming that the decorative layer does not block primary navigation.

## Saved vehicle regression coverage

The saved vehicle profile is stored under `zalim-market:vehicle-profile`. It accepts only a supported UK, US, or Australian market combined with string make, model, and year fields. The added regression suite confirms a valid Australian Ford Ranger profile is recovered and malformed JSON, unsupported markets, and invalid field types are rejected safely.

## Product-media availability

All ten uploaded product-image groups were requested through their public storefront paths with redirects followed. Each returned **HTTP 200**. The catalogue continues to use `loading="lazy"` and `decoding="async"`; the full-page capture utility may retain the deliberate card fallback for off-screen native lazy images, but no blank visual state is presented while an image has not yet loaded or fails.

## Validation result

TypeScript completed without errors. The configured Vitest suite completed with **7 passing files and 36 passing tests**, including three focused particle-focus mapping cases. Current development-server and browser-console log checks show no new application errors after the refinement. This audit confirms the implementation safeguards and responsive presentation; it does not claim a device-specific frame-rate measurement.
