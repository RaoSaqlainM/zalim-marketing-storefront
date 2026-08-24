import { describe, expect, it } from "vitest";
import { demoOrderTotal, nextDemoOrderStatus, validateTestPayment } from "../client/src/lib/demoOrder";

describe("demo order helpers", () => {
  it("only accepts a fictional test payment reference", () => {
    expect(validateTestPayment({ cardholder: "Test Customer", reference: "DEMO-4242" })).toBeNull();
    expect(validateTestPayment({ cardholder: "Test Customer", reference: "4242 4242 4242 4242" })).toBe("Use a fictional reference in the format DEMO-4242.");
  });

  it("calculates an itemized simulated order total", () => {
    expect(demoOrderTotal([{ name: "Meridian 5W-30", quantity: 2, price: 46, sku: "OIL-530" }])).toBe(92);
  });

  it("advances test-order status without exceeding delivered", () => {
    expect(nextDemoOrderStatus("placed")).toBe("packed");
    expect(nextDemoOrderStatus("delivered")).toBe("delivered");
  });
});
