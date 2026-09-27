import { formatMoney } from "./formatMoney";

describe("formatMoney", () => {
  it("keeps IRR in its canonical unit without implicit Toman conversion", () => {
    const formatted = formatMoney(1_000, "IRR", {
      locale: "en-US",
      currencyDisplay: "code",
    });

    expect(formatted).toContain("IRR");
    expect(formatted).toContain("1,000");
  });

  it("preserves the numeric amount when the currency changes", () => {
    const usd = formatMoney(1_000, "USD", {
      locale: "en-US",
      currencyDisplay: "code",
    });
    const irr = formatMoney(1_000, "IRR", {
      locale: "en-US",
      currencyDisplay: "code",
    });

    expect(usd).toContain("1,000");
    expect(irr).toContain("1,000");
    expect(usd).toContain("USD");
    expect(irr).toContain("IRR");
  });

  it("supports Persian digits when fa-IR is requested", () => {
    const formatted = formatMoney(1_234, "IRR", {
      locale: "fa-IR",
      currencyDisplay: "code",
    });

    expect(formatted).toMatch(/[۰-۹]/);
  });

  it("supports compact notation without changing the amount semantics", () => {
    const formatted = formatMoney(1_200_000, "USD", {
      locale: "en-US",
      notation: "compact",
      currencyDisplay: "code",
    });

    expect(formatted).toContain("USD");
    expect(formatted).toContain("1.2M");
  });

  it("keeps negative values negative", () => {
    const formatted = formatMoney(-5_000, "USD", {
      locale: "en-US",
      currencyDisplay: "code",
    });

    expect(formatted).toContain("-");
    expect(formatted).toContain("5,000");
  });

  it("returns the fallback for missing or non-finite values", () => {
    expect(formatMoney(null, "USD")).toBe("—");
    expect(formatMoney(undefined, "USD")).toBe("—");
    expect(formatMoney(Number.NaN, "USD")).toBe("—");
    expect(formatMoney(Number.POSITIVE_INFINITY, "USD")).toBe("—");
  });

  it("does not infer non-ISO units such as Toman", () => {
    const formatted = formatMoney(10_000, "TOMAN", {
      locale: "en-US",
    });

    expect(formatted).toBe("10,000 TOMAN");
  });
});
