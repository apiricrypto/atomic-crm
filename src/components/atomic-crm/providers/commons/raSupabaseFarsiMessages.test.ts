import { describe, expect, it } from "vitest";
import { raSupabaseEnglishMessages } from "ra-supabase-language-english";
import { raSupabaseFarsiMessages } from "./raSupabaseFarsiMessages";

const flatten = (
  messages: Record<string, unknown>,
  prefix = "",
): [string, string][] =>
  Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? [[path, value]]
      : flatten(value as Record<string, unknown>, path);
  });

describe("Persian Supabase overlay", () => {
  const english = new Map(flatten(raSupabaseEnglishMessages));
  const farsi = new Map(flatten(raSupabaseFarsiMessages));

  it("matches the installed upstream message keys without obsolete entries", () => {
    expect([...farsi.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it("preserves every interpolation placeholder", () => {
    const placeholders = (message: string) =>
      [...message.matchAll(/%\{([^}]+)\}/g)].map((match) => match[1]).sort();
    for (const [key, message] of english) {
      expect(placeholders(farsi.get(key) ?? ""), key).toEqual(
        placeholders(message),
      );
    }
  });

  it("provides nonempty Persian text for each upstream message", () => {
    for (const [key, message] of farsi) {
      expect(message.trim(), key).toMatch(/[\u0600-\u06ff]/);
    }
  });
});
