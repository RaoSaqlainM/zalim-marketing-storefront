# Interactive Particle Design Audit

## Selected scenes

The interaction is intentionally limited to the homepage’s **hero** and **road-trip/touring** particle fields. These are the two large dark scenes where a small atmospheric response can reinforce depth without competing with catalogue browsing, form controls, or the light editorial sections.

## Interaction model

Pointer movement will update two CSS custom properties representing a normalized horizontal and vertical focus point. A non-interactive visual layer will use those values for a soft radial highlight and a modest transform offset. On touch devices, the same pointer events will react while a finger moves across the scene, then ease back to centre after release. The effect is decorative only and does not alter links, buttons, scroll behavior, or the content layout.

| Constraint | Implementation decision |
|---|---|
| Normal controls must work | The interaction layer uses `pointer-events: none`; no event calls `preventDefault`, pointer capture, or click handling. |
| Motion must remain lightweight | At most one `requestAnimationFrame` update is queued per input frame. CSS variables drive transforms and opacity only; no canvas, DOM particle creation, layout reads per move, or scrolling changes are introduced. |
| Motion should feel composed | Focus values are clamped to the scene bounds and visual movement is intentionally limited to a small offset. Leave, cancel, and touch release return the atmosphere toward its neutral centre. |
| Accessibility must be preserved | All listeners are disabled for `prefers-reduced-motion: reduce`; the existing static particle composition and content remain fully visible. |
| Scope must remain premium, not noisy | Interaction applies only to the selected dark home scenes, with a soft gold/blue luminance shift instead of a cursor-tracking spotlight or dense simulation. |
