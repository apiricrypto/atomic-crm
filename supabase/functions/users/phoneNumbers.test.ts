// @vitest-environment node
import { describe, expect, it } from "vitest";

import { normalizePhoneNumber } from "./phoneNumbers";

describe("normalizePhoneNumber", () => {
  it.each([
    ["0912 345 6789", "+989123456789"],
    ["۹۱۲۳۴۵۶۷۸۹", "+989123456789"],
    ["+98 (912) 345-6789", "+989123456789"],
    ["0098 912 345 6789", "+989123456789"],
    ["+447700900123", "+447700900123"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });

  it.each([undefined, null, "", "091234", "not-a-phone"])(
    "rejects %s",
    (input) => expect(normalizePhoneNumber(input)).toBeNull(),
  );
});
