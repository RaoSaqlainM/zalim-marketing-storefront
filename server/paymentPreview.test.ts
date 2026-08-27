import { describe, expect, it } from "vitest";
import { paymentPreviewConfirmation, paymentPreviewDelayMs } from "../client/src/lib/paymentPreview";

describe("payment preview", () => {
  it("keeps the simulated confirmation explicitly non-processing", () => {
    expect(paymentPreviewConfirmation("transfer").detail).toContain("fictional transfer-route preview");
    expect(paymentPreviewConfirmation("transfer").detail).toContain("Nothing has been charged or sent to a provider");
  });

  it("uses a short visual feedback interval", () => {
    expect(paymentPreviewDelayMs).toBeGreaterThanOrEqual(500);
    expect(paymentPreviewDelayMs).toBeLessThanOrEqual(1500);
  });
});
