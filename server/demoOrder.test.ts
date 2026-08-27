import { describe, expect, it } from "vitest";
import { demoCheckoutSample, demoDeliveryGuidance, demoOrderProgressIndex, demoOrderTotal, nextDemoOrderStatus, validateTestPayment } from "../client/src/lib/demoOrder";

describe("demo order helpers", () => {
  it("only accepts a fictional test payment reference", () => {
    expect(validateTestPayment({ cardholder: "Test Customer", reference: "DEMO-4242" })).toBeNull();
    expect(validateTestPayment({ cardholder: "Test Customer", reference: "4242 4242 4242 4242" })).toBe("Use a fictional reference in the format DEMO-4242.");
  });

  it("provides clearly fictional sample checkout values that pass the test-only validation", () => {
    expect(demoCheckoutSample.enquiry.address).toContain("not a real address");
    expect(validateTestPayment(demoCheckoutSample.payment)).toBeNull();
  });

  it("calculates an itemized simulated order total", () => {
    expect(demoOrderTotal([{ name: "Meridian 5W-30", quantity: 2, price: 46, sku: "OIL-530" }])).toBe(92);
  });

  it("advances test-order status without exceeding delivered", () => {
    expect(nextDemoOrderStatus("placed")).toBe("packed");
    expect(nextDemoOrderStatus("delivered")).toBe("delivered");
  });

  it("maps detailed statuses to Processing, Shipped, and Delivered progress stages", () => {
    expect(demoOrderProgressIndex("placed")).toBe(0);
    expect(demoOrderProgressIndex("packed")).toBe(0);
    expect(demoOrderProgressIndex("dispatched")).toBe(1);
    expect(demoOrderProgressIndex("delivered")).toBe(2);
  });

  it("keeps simulated delivery guidance explicit at every detailed stage", () => {
    expect(demoDeliveryGuidance.dispatched.text).toContain("illustrative only");
    expect(demoDeliveryGuidance.delivered.text).toContain("No delivery confirmation");
  });
});
