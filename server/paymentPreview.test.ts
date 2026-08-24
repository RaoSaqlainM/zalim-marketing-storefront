import { describe, expect, it } from "vitest";
import { paymentPreviewConfirmation, paymentPreviewDelayMs } from "../client/src/lib/paymentPreview";

describe("payment preview", () => {
  it("keeps the simulated confirmation explicitly non-processing", () => {
    expect(paymentPreviewConfirmation("transfer").detail).toContain("No payment has been processed");
    expect(paymentPreviewConfirmation("transfer").detail).toContain("Bank transfer after confirmation");
  });

  it("uses a short visual feedback interval", () => {
    expect(paymentPreviewDelayMs).toBeGreaterThanOrEqual(500);
    expect(paymentPreviewDelayMs).toBeLessThanOrEqual(1500);
  });
});
