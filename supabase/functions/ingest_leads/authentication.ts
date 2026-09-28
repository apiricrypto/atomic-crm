import { isConnectorSource, type ConnectorSource } from "./contract.ts";

const TOKEN_ENV_NAMES: Record<ConnectorSource, string> = {
  bale_market: "SATNO_BALE_MARKET_INGEST_TOKEN",
  tender_radar: "SATNO_TENDER_RADAR_INGEST_TOKEN",
};

const encoder = new TextEncoder();

async function digest(value: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(value)),
  );
}

export async function secretsEqual(actual: string, expected: string) {
  const [actualDigest, expectedDigest] = await Promise.all([
    digest(actual),
    digest(expected),
  ]);
  let difference = 0;
  for (let index = 0; index < actualDigest.length; index += 1) {
    difference |= actualDigest[index] ^ expectedDigest[index];
  }
  return difference === 0;
}

export function readConnectorSource(req: Request): ConnectorSource | null {
  const source = req.headers.get("x-satno-connector");
  return isConnectorSource(source) ? source : null;
}

export function readBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

export function getConnectorToken(
  source: ConnectorSource,
  getEnv: (name: string) => string | undefined,
) {
  return getEnv(TOKEN_ENV_NAMES[source]);
}
