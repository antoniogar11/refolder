import { describe, it, expect } from "vitest";
import { cn, roundCurrency, formatDuration, computeSellingPrice } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("roundCurrency", () => {
  it("rounds to 2 decimals", () => {
    expect(roundCurrency(10.456)).toBe(10.46);
  });

  it("keeps exact values", () => {
    expect(roundCurrency(10.45)).toBe(10.45);
  });

  it("handles floating point errors", () => {
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
  });

  it("rounds down correctly", () => {
    expect(roundCurrency(10.454)).toBe(10.45);
  });

  it("handles zero", () => {
    expect(roundCurrency(0)).toBe(0);
  });

  it("handles negative numbers", () => {
    expect(roundCurrency(-10.456)).toBe(-10.46);
  });
});

describe("formatDuration", () => {
  it("returns 'En curso' for null", () => {
    expect(formatDuration(null)).toBe("En curso");
  });

  it("formats minutes only", () => {
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats hours only", () => {
    expect(formatDuration(120)).toBe("2 h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1 h 30 min");
  });
});

describe("computeSellingPrice", () => {
  it("computes selling price with 20% margin", () => {
    expect(computeSellingPrice(100, 20)).toBe(120);
  });

  it("handles zero margin", () => {
    expect(computeSellingPrice(100, 0)).toBe(100);
  });

  it("handles 100% margin", () => {
    expect(computeSellingPrice(100, 100)).toBe(200);
  });

  it("handles small margins", () => {
    expect(computeSellingPrice(50, 10)).toBe(55);
  });

  it("rounds correctly", () => {
    // 33.33 * 1.15 = 38.3295 → should round to 38.33
    expect(computeSellingPrice(33.33, 15)).toBe(38.33);
  });

  it("handles zero cost", () => {
    expect(computeSellingPrice(0, 20)).toBe(0);
  });

  it("handles decimal margin", () => {
    // 100 * 1.125 = 112.5
    expect(computeSellingPrice(100, 12.5)).toBe(112.5);
  });
});

describe("formatCurrency", () => {
  it("formats a positive number as EUR", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1234,56");
    expect(result).toContain("€");
  });

  it("returns dash for null", () => {
    expect(formatCurrency(null)).toBe("-");
  });

  it("returns dash for undefined", () => {
    expect(formatCurrency(undefined)).toBe("-");
  });

  it("shows zero when showZero option is set", () => {
    const result = formatCurrency(null, { showZero: true });
    expect(result).toContain("0");
    expect(result).toContain("€");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });
});
