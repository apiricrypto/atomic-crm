import { describe, expect, it } from "vitest";

import {
  normalizeOtpToken,
  normalizePhoneNumber,
  requestPhoneOtp,
  toAsciiDigits,
  verifyPhoneOtp,
} from "./phoneOtp";

describe("phone OTP normalization", () => {
  it.each([
    ["0912 345 6789", "+989123456789"],
    ["۹۱۲۳۴۵۶۷۸۹", "+989123456789"],
    ["+98 (912) 345-6789", "+989123456789"],
    ["0098 912 345 6789", "+989123456789"],
    ["+447700900123", "+447700900123"],
  ])("normalizes %s to E.164", (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });

  it.each(["", "091234", "0098912", "91234abc6789", "+00123456789"])(
    "rejects invalid phone input %s",
    (input) => expect(normalizePhoneNumber(input)).toBeNull(),
  );

  it("converts Persian and Arabic OTP digits", () => {
    expect(toAsciiDigits("۱۲٣۴٥۶")).toBe("123456");
    expect(normalizeOtpToken("۱۲۳ ۴۵۶")).toBe("123456");
  });

  it.each(["12345", "123456789", "12a456"])(
    "rejects invalid OTP token %s",
    (input) => expect(normalizeOtpToken(input)).toBeNull(),
  );
});

describe("phone OTP Supabase contract", () => {
  it("requests a code without allowing unknown phone numbers to create users", async () => {
    const calls: unknown[] = [];
    const auth = {
      signInWithOtp: async (credentials: unknown) => {
        calls.push(credentials);
        return { error: null };
      },
      verifyOtp: async () => ({ error: null }),
    };

    await requestPhoneOtp(auth, "+989123456789");
    expect(calls).toEqual([
      {
        phone: "+989123456789",
        options: { shouldCreateUser: false },
      },
    ]);
  });

  it("verifies the SMS token against the same normalized phone", async () => {
    const calls: unknown[] = [];
    const auth = {
      signInWithOtp: async () => ({ error: null }),
      verifyOtp: async (credentials: unknown) => {
        calls.push(credentials);
        return { error: null };
      },
    };

    await verifyPhoneOtp(auth, "+989123456789", "123456");
    expect(calls).toEqual([
      { phone: "+989123456789", token: "123456", type: "sms" },
    ]);
  });
});
