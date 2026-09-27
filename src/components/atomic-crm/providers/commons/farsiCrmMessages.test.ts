import { describe, expect, it } from "vitest";
import { englishCrmMessages } from "./englishCrmMessages";
import { farsiCrmMessages } from "./farsiCrmMessages";

const flattenMessages = (
  value: Record<string, unknown>,
  prefix = "",
  output = new Map<string, string>(),
): Map<string, string> => {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof child === "string") {
      output.set(path, child);
      continue;
    }

    if (child && typeof child === "object") {
      flattenMessages(child as Record<string, unknown>, path, output);
    }
  }

  return output;
};

const getPlaceholders = (message: string): string[] =>
  [...message.matchAll(/%\{([^}]+)\}/g)].map((match) => match[1]).sort();

describe("farsiCrmMessages", () => {
  const english = flattenMessages(englishCrmMessages);
  const farsi = flattenMessages(farsiCrmMessages);

  it("covers every current CRM message key", () => {
    const missingKeys = [...english.keys()].filter((key) => !farsi.has(key));

    expect(missingKeys).toEqual([]);
  });

  it("keeps Polyglot placeholders compatible with English", () => {
    const incompatibleKeys = [...english.entries()]
      .filter(([key]) => farsi.has(key))
      .filter(
        ([key, englishMessage]) =>
          JSON.stringify(getPlaceholders(englishMessage)) !==
          JSON.stringify(getPlaceholders(farsi.get(key) ?? "")),
      )
      .map(([key]) => key);

    expect(incompatibleKeys).toEqual([]);
  });

  it("contains Persian translations for critical navigation and entities", () => {
    expect(farsiCrmMessages.crm.language).toBe("زبان");
    expect(farsiCrmMessages.resources.companies.name).toContain("شرکت");
    expect(farsiCrmMessages.resources.deals.name).toContain("معامله");
  });
});
