import { describe, expect, it } from "vitest";
import { getOilFitmentGuide, identifierIsPlausible, normalizeVehicleIdentifier } from "../client/src/lib/oilFitmentGuide";

describe("oil fitment guide", () => {
  it("normalizes a vehicle identifier locally", () => {
    expect(normalizeVehicleIdentifier(" ab-12 cde ")).toBe("AB12CDE");
  });

  it("checks basic registration and VIN shapes without decoding them", () => {
    expect(identifierIsPlausible("AB12 CDE", "registration")).toBe(true);
    expect(identifierIsPlausible("1HGCM82633A004352", "vin")).toBe(true);
    expect(identifierIsPlausible("ABC", "vin")).toBe(false);
  });

  it("keeps diesel advice as a handbook-confirmation guide", () => {
    const guide = getOilFitmentGuide("diesel");
    expect(guide.grades.map(item => item.grade)).toEqual(["5W-30", "5W-40"]);
    expect(guide.handbookNote).toMatch(/handbook/i);
  });
});
