const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toAsciiDigits(value: string) {
  return Array.from(value, (character) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(character);
    if (persianIndex >= 0) return String(persianIndex);

    const arabicIndex = ARABIC_DIGITS.indexOf(character);
    return arabicIndex >= 0 ? String(arabicIndex) : character;
  }).join("");
}

/**
 * Normalizes Iranian local mobile numbers and already international E.164
 * numbers. Returns null instead of guessing when the input is ambiguous.
 */
export function normalizePhoneNumber(value: string): string | null {
  let phone = toAsciiDigits(value)
    .trim()
    .replace(/[\s()-]/g, "");
  if (!phone) return null;

  if (phone.startsWith("0098")) phone = `+98${phone.slice(4)}`;
  else if (/^09\d{9}$/.test(phone)) phone = `+98${phone.slice(1)}`;
  else if (/^9\d{9}$/.test(phone)) phone = `+98${phone}`;

  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

export function normalizeOtpToken(value: string): string | null {
  const token = toAsciiDigits(value).replace(/\s/g, "");
  return /^\d{6,8}$/.test(token) ? token : null;
}

export type PhoneOtpAuthClient = {
  signInWithOtp: (credentials: {
    phone: string;
    options: { shouldCreateUser: false };
  }) => Promise<{ error: unknown }>;
  verifyOtp: (credentials: {
    phone: string;
    token: string;
    type: "sms";
  }) => Promise<{ error: unknown }>;
};

export async function requestPhoneOtp(auth: PhoneOtpAuthClient, phone: string) {
  return auth.signInWithOtp({
    phone,
    // Raw phone numbers must never create users outside the staff workflow.
    options: { shouldCreateUser: false },
  });
}

export async function verifyPhoneOtp(
  auth: PhoneOtpAuthClient,
  phone: string,
  token: string,
) {
  return auth.verifyOtp({ phone, token, type: "sms" });
}
