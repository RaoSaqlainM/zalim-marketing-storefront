export type ParticleBounds = { left: number; top: number; width: number; height: number };

export type ParticleFocus = { x: number; y: number; offsetX: number; offsetY: number };

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function mapParticleFocus(clientX: number, clientY: number, bounds: ParticleBounds): ParticleFocus | null {
  if (!Number.isFinite(bounds.width) || !Number.isFinite(bounds.height) || bounds.width <= 0 || bounds.height <= 0) return null;
  const x = clamp((clientX - bounds.left) / bounds.width);
  const y = clamp((clientY - bounds.top) / bounds.height);
  return { x, y, offsetX: Math.round((x - 0.5) * 16), offsetY: Math.round((y - 0.5) * 12) };
}

export function interpolateParticleFocus(current: ParticleFocus, target: ParticleFocus, blend: number): ParticleFocus {
  return {
    x: current.x + (target.x - current.x) * blend,
    y: current.y + (target.y - current.y) * blend,
    offsetX: current.offsetX + (target.offsetX - current.offsetX) * blend,
    offsetY: current.offsetY + (target.offsetY - current.offsetY) * blend,
  };
}
