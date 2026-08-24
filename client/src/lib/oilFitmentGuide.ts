export type FuelType = "petrol" | "diesel" | "hybrid" | "not-sure";

export type OilFitmentGuide = {
  title: string;
  summary: string;
  grades: Array<{ grade: string; quality: string; note: string }>;
  handbookNote: string;
};

export function normalizeVehicleIdentifier(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function identifierIsPlausible(value: string, type: "registration" | "vin") {
  const normalized = normalizeVehicleIdentifier(value);
  return type === "vin" ? normalized.length === 17 : normalized.length >= 3 && normalized.length <= 10;
}

export function getOilFitmentGuide(fuel: FuelType): OilFitmentGuide {
  if (fuel === "diesel") return {
    title: "Diesel oil shortlist to confirm",
    summary: "Start by checking low-SAPS protection and the exact manufacturer approval, especially where a DPF is fitted.",
    grades: [
      { grade: "5W-30", quality: "Fully synthetic", note: "A common starting grade where the handbook specifies the right approval." },
      { grade: "5W-40", quality: "Performance synthetic", note: "Useful to review for certain higher-mileage or demanding-use applications." },
    ],
    handbookNote: "Confirm the manufacturer approval, viscosity and DPF requirements in the handbook before purchase.",
  };
  if (fuel === "hybrid") return {
    title: "Hybrid and economy oil shortlist to confirm",
    summary: "Start with low-viscosity fully synthetic oil only where the vehicle handbook specifies it.",
    grades: [
      { grade: "0W-20", quality: "Fully synthetic", note: "Often specified for efficiency-focused engines, subject to exact approval." },
      { grade: "5W-30", quality: "Fully synthetic", note: "A practical alternative to review only when the handbook permits it." },
    ],
    handbookNote: "Confirm the exact viscosity and manufacturer approval in the handbook before purchase.",
  };
  if (fuel === "petrol") return {
    title: "Petrol engine oil shortlist to confirm",
    summary: "Start with a fully synthetic candidate, then verify the grade and manufacturer approval in the handbook.",
    grades: [
      { grade: "5W-30", quality: "Fully synthetic", note: "A common modern-petrol starting point when the listed approval matches." },
      { grade: "5W-40", quality: "Performance synthetic", note: "A candidate to review for certain hotter or more demanding applications." },
    ],
    handbookNote: "Confirm the manufacturer approval, viscosity and service interval in the handbook before purchase.",
  };
  return {
    title: "Motor-oil starting points to confirm",
    summary: "Choose the fuel type if known to narrow the guide. A registration or VIN alone is not decoded by this demo.",
    grades: [
      { grade: "0W-20", quality: "Fully synthetic", note: "Check whether a low-viscosity oil is required." },
      { grade: "5W-30", quality: "Fully synthetic", note: "Check the manufacturer approval before choosing." },
      { grade: "5W-40", quality: "Performance synthetic", note: "Check suitability for mileage and operating conditions." },
    ],
    handbookNote: "Confirm the manufacturer approval and viscosity in the handbook before purchase.",
  };
}
