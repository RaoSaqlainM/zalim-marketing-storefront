export type ParticleBounds = { left: number; top: number; width: number; height: number };

export type ParticleFocus = { x: number; y: number; offsetX: number; offsetY: number };

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function mapParticleFocus(clientX: number, clientY: number, bounds: ParticleBounds): ParticleFocus | null {
  if (!Number.isFinite(bounds.width) || !Number.isFinite(bounds.height) || bounds.width <= 0 || bounds.height <= 0) return null;
  const x = clamp((clientX - bounds.left) / bounds.width);
  const y = clamp((clientY - bounds.top) / bounds.height);
  return { x, y, offsetX: Math.round((x - 0.5) * 30), offsetY: Math.round((y - 0.5) * 20) };
}
