const SENSITIVE_KEY_MARKERS = [
  "accesstoken",
  "apikey",
  "authorization",
  "bearer",
  "captcha",
  "cookie",
  "credential",
  "csrf",
  "otp",
  "password",
  "refreshtoken",
  "secret",
  "session",
  "token",
] as const;

const normalizeKey = (key: string) =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

export const isSensitiveKey = (key: string) => {
  const normalized = normalizeKey(key);
  return SENSITIVE_KEY_MARKERS.some((marker) => normalized.includes(marker));
};

export function findSensitiveKey(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findSensitiveKey(entry);
      if (found) return found;
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;
  for (const [key, nested] of Object.entries(value)) {
    if (isSensitiveKey(key)) return key;
    const found = findSensitiveKey(nested);
    if (found) return found;
  }
  return null;
}

export function findSensitiveUrlPart(url: URL): string | null {
  if (url.username || url.password) return "userinfo";
  for (const key of url.searchParams.keys()) {
    if (isSensitiveKey(key)) return key;
  }
  return null;
}
