export const savedVehicleKey = "zalim-market:vehicle-profile";

const vehicleMarkets = ["United Kingdom", "United States", "Australia"] as const;

export type VehicleProfile = { market: (typeof vehicleMarkets)[number]; make: string; model: string; year: string };

export function parseSavedVehicleProfile(storedValue: string | null): VehicleProfile | null {
  try {
    const stored = JSON.parse(storedValue || "null");
    if (stored && vehicleMarkets.includes(stored.market) && typeof stored.make === "string" && typeof stored.model === "string" && typeof stored.year === "string") return stored as VehicleProfile;
  } catch {}
  return null;
}

export function readSavedVehicleProfile(): VehicleProfile | null {
  if (typeof window === "undefined") return null;
  return parseSavedVehicleProfile(window.localStorage.getItem(savedVehicleKey));
}
