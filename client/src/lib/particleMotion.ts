export type ParticleBounds = { left: number; top: number; width: number; height: number };

export type ParticleFocus = { x: number; y: number; offsetX: number; offsetY: number };

export type HeroDepth = { offsetX: number; offsetY: number; tiltX: number; tiltY: number };

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function mapParticleFocus(clientX: number, clientY: number, bounds: ParticleBounds): ParticleFocus | null {
  if (!Number.isFinite(bounds.width) || !Number.isFinite(bounds.height) || bounds.width <= 0 || bounds.height <= 0) return null;
  const x = clamp((clientX - bounds.left) / bounds.width);
  const y = clamp((clientY - bounds.top) / bounds.height);
  return { x, y, offsetX: Math.round((x - 0.5) * 32), offsetY: Math.round((y - 0.5) * 24) };
}

export function interpolateParticleFocus(current: ParticleFocus, target: ParticleFocus, blend: number): ParticleFocus {
  return {
    x: current.x + (target.x - current.x) * blend,
    y: current.y + (target.y - current.y) * blend,
    offsetX: current.offsetX + (target.offsetX - current.offsetX) * blend,
    offsetY: current.offsetY + (target.offsetY - current.offsetY) * blend,
  };
}

export function mapHeroDepth(focus: ParticleFocus): HeroDepth {
  return {
    offsetX: Math.round(focus.offsetX * 2.75),
    offsetY: Math.round(focus.offsetY * 2.25),
    tiltX: Number(((0.5 - focus.y) * 2.2).toFixed(2)),
    tiltY: Number(((focus.x - 0.5) * 2.8).toFixed(2)),
  };
}
