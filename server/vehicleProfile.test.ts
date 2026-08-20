import { describe, expect, it } from "vitest";
import { parseSavedVehicleProfile } from "../client/src/lib/vehicleProfile";

describe("saved vehicle profile parsing", () => {
  it("recovers a complete profile for a supported vehicle market", () => {
    expect(parseSavedVehicleProfile(JSON.stringify({ market: "Australia", make: "Ford", model: "Ranger", year: "2024" }))).toEqual({ market: "Australia", make: "Ford", model: "Ranger", year: "2024" });
  });

  it.each([null, "not-json", JSON.stringify({ market: "Germany", make: "Ford", model: "Focus", year: "2024" }), JSON.stringify({ market: "United Kingdom", make: "Ford", model: 7, year: "2024" })])("rejects invalid stored profile data", storedValue => {
    expect(parseSavedVehicleProfile(storedValue)).toBeNull();
  });
});
