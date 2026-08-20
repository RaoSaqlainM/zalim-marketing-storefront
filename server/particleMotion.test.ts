import { describe, expect, it } from "vitest";
import { mapParticleFocus } from "../client/src/lib/particleMotion";

describe("particle focus mapping", () => {
  it("maps the centre of a scene to a neutral visual offset", () => {
    expect(mapParticleFocus(150, 100, { left: 50, top: 20, width: 200, height: 160 })).toEqual({ x: 0.5, y: 0.5, offsetX: 0, offsetY: 0 });
  });

  it("clamps pointer positions beyond a scene boundary", () => {
    expect(mapParticleFocus(500, -20, { left: 0, top: 0, width: 300, height: 200 })).toEqual({ x: 1, y: 0, offsetX: 15, offsetY: -10 });
  });

  it("does not produce movement data when the scene has no measurable size", () => {
    expect(mapParticleFocus(10, 10, { left: 0, top: 0, width: 0, height: 200 })).toBeNull();
  });
});
