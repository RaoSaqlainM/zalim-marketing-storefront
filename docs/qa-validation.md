# Zalim-Marketing QA Validation Record

**Validated:** 20 August 2026  
**Scope:** The original Zalim-Marketing automotive marketplace, EUR catalogue, vehicle-led discovery, enquiry flow, responsive presentation, and public route coverage.

## Product and public-route coverage

| Area | Routes or scenarios reviewed | Desktop | Mobile | Result |
|---|---|---:|---:|---|
| Shared storefront shell | `/` | Reviewed | Reviewed | Zalim-Marketing header, primary navigation, basket and account controls, support footer, owner attribution, WhatsApp, email, and EUR enquiry message remain present and readable. |
| Marketplace homepage | `/` | Reviewed | Reviewed | Full-width hero, vehicle entry point, departments, product selections, and practical guidance sections render within the original Zalim-Marketing system. |
| Full catalogue | `/shop` | Reviewed | Reviewed | Product cards, EUR prices, filters, sort menu, grid/list control, and no-results recovery state render without clipping. |
| Vehicle-led discovery | `/vehicle-finder` | Reviewed | Reviewed | UK, US, and Australian market selection plus common Ford, Toyota, Volkswagen, BMW, Honda, Chevrolet, Jeep, Mazda, Hyundai, and Subaru context is reachable. |
| Direct departments | `/collections/car-care`, `/collections/cabin-comfort`, `/collections/tech-power`, `/collections/roadside-utility` | Reviewed | Reviewed | Each header department destination resolves to its own filtered catalogue view with EUR pricing. |
| Directories and brands | `/collections`, `/brands`, `/brands/atlas-supply` | Reviewed | Reviewed | Department and brand destinations resolve to visibly labelled directory or filtered catalogue pages. |
| Search | `/search?q=beacon` | Reviewed | Reviewed | The live Nova Emergency Beacon Light is returned for the lowercase matching search term after the case-insensitive search correction. |
| Product page | `/products/nova-emergency-beacon-light` | Reviewed | Reviewed | Product media, fitment context, EUR price, basket action, and direct support option render without payment controls. |
| Basket and enquiry | `/cart`, `/checkout` | Reviewed | Reviewed | The basket routes to an order-enquiry form that prepares request details for WhatsApp contact; no payment collection UI is displayed. |
| Account and request details | `/account`, `/orders/<order-number>`, `/order-confirmation?order=<order-number>` | Reviewed | Reviewed | Protected routes and missing-request fallbacks provide clear account recovery without payment-facing messaging. |
| Support and policies | `/about`, `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms` | Reviewed | Reviewed | Support pages use the shared presentation; the contact page and footer expose +92 325 5531155 and raosaqlaingee@gmail.com. |
| Fallback page | `/404` | Reviewed | Reviewed | The fallback route now uses the shared Zalim-Marketing shell, breadcrumb treatment, catalogue recovery action, and footer. |
| Protected control room | `/admin` as an administrator | Reviewed | N/A | The Zalim-Marketing control room maintains role-gated catalogue and enquiry-order management. |

## Header, footer, and public action audit

| Surface | Destinations or action | Result |
|---|---|---|
| Desktop header | Shop all, Shop by vehicle, Car care, Interior, Lighting & tech, Utility & touring | Each destination resolves through a visible marketplace route. |
| Mobile menu | Primary department links, all categories, contact and WhatsApp support | Controls are touch-sized and resolve to an internal route or the owner support channel. |
| Header search | Query submission and live suggestions | Search routes to matching product results and supports keyboard interaction. |
| Footer shop links | Shop all, Shop by vehicle, categories, brands | All links point to active discovery routes. |
| Footer information links | About, FAQ, delivery, returns, privacy, terms | All support and policy routes are registered in the application map. |
| Footer support links | WhatsApp, email, contact guidance | WhatsApp uses `+923255531155`; email uses `raosaqlaingee@gmail.com`; contact guidance opens the dedicated support page. |

## Media, performance, and accessibility review

| Area | Result |
|---|---|
| Product and directory media | Product and directory images use native lazy loading and asynchronous image decoding. The reviewed catalogue imagery uses the established `/manus-storage/` asset paths. |
| Layout and motion | The marketplace uses reserved image frames, responsive grids, lightweight route feedback, and short CSS transitions. There are no heavy scroll-triggered animation dependencies in the rebuilt storefront. |
| Responsive hierarchy | Mobile checks covered home, catalogue, vehicle finder, product, basket, enquiry, contact, privacy, and the primary directory routes. Desktop checks covered core discovery, support, policy, account, administration entry, direct departments, brand detail, search, enquiry confirmation, and fallback rendering. |
| Keyboard and assistive interaction | The header search exposes combobox/listbox semantics, keyboard selection and escape behavior. Native buttons, links, labelled inputs, and the shared skip link provide keyboard-accessible navigation. |
| Source comment audit | A targeted comment audit across the rebuilt application route, shared storefront components, product discovery components, static pages, account and administration pages returned no line or block comments. Untouched framework/template files were excluded from the rebuild scope. |

## Automated validation

`pnpm check` completed successfully after the final search and fallback-page correction. `pnpm test -- --run` completed successfully with **25 passing tests** across authentication, commerce router input safety, catalogue filtering and pagination, lowercase matching search regression, cart safeguards, notifications, and existing payment-service boundary coverage.

## Deployment note

Public storefront pages display an enquiry-first ordering journey only. No payment method, payment collection form, provider readiness message, or payment setup prompt is exposed in the reviewed public routes. Catalogue prices are presented in EUR; product availability, delivery details, and any later payment arrangement are confirmed directly through the listed support channels.
