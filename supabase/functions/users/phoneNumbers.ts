const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toAsciiDigits(value: string) {
  return Array.from(value, (character) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(character);
    if (persianIndex >= 0) return String(persianIndex);

    const arabicIndex = ARABIC_DIGITS.indexOf(character);
    return arabicIndex >= 0 ? String(arabicIndex) : character;
  }).join("");
}

export function normalizePhoneNumber(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let phone = toAsciiDigits(value)
    .trim()
    .replace(/[\s()-]/g, "");
  if (!phone) return null;

  if (phone.startsWith("0098")) phone = `+98${phone.slice(4)}`;
  else if (/^09\d{9}$/.test(phone)) phone = `+98${phone.slice(1)}`;
  else if (/^9\d{9}$/.test(phone)) phone = `+98${phone}`;

  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}
