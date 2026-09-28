import { readFile } from "node:fs/promises";
import path from "node:path";

import { createTenderStateInspector } from "./satno-tender-concurrency-state.mjs";

export const CONFIRMATION = "DISPOSABLE-ONLY";
export const MANIFEST_VERSION = 1;

const REQUIRED_CASES = new Map([
  ["import_need_no", "single_conflict"],
  ["import_tender_no", "single_conflict"],
  ["import_source_retry", "idempotent_retry"],
  ["import_fingerprint", "single_conflict"],
  ["verify_need_no", "single_conflict"],
  ["verify_tender_no", "single_conflict"],
]);

const RPC_BY_CASE = {
  import_need_no: "import_tender_opportunity",
  import_tender_no: "import_tender_opportunity",
  import_source_retry: "import_tender_opportunity",
  import_fingerprint: "import_tender_opportunity",
  verify_need_no: "record_setad_verification",
  verify_tender_no: "record_setad_verification",
};

const IMPORT_REVIEW_KEYS = new Set([
  "opportunity_type",
  "domain",
  "title",
  "description",
  "organizer",
  "province",
  "city",
  "publish_date",
  "document_deadline",
  "submission_deadline",
  "official_need_no",
  "official_tender_no",
  "official_source_url",
  "trade",
  "category",
  "verification_status",
  "radar_score",
  "radar_grade",
  "fallback_fingerprint",
  "assigned_sales_id",
]);

const VERIFICATION_KEYS = new Set([
  "verification_status",
  "official_need_no",
  "official_tender_no",
  "title",
  "description",
  "organizer",
  "province",
  "city",
  "publish_date",
  "document_deadline",
  "submission_deadline",
  "official_source_url",
]);

const SENSITIVE_KEY =
  /(password|secret|token|cookie|captcha|otp|session|authorization|api.?key|jwt)/i;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertKeys(value, allowed, label) {
  if (!isObject(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${label} has an unsupported field`);
  }
}

function assertNoSensitiveKeys(value) {
  if (Array.isArray(value)) {
    value.forEach(assertNoSensitiveKeys);
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) {
      throw new Error("Manifest contains a forbidden sensitive field");
    }
    assertNoSensitiveKeys(child);
  }
}

function requiredText(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function requiredPositiveInteger(value, label) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

function validateImportRequest(request, label) {
  assertKeys(request, new Set(["actor", "args"]), label);
  if (!new Set(["a", "b"]).has(request.actor)) {
    throw new Error(`${label}.actor must be a or b`);
  }
  assertKeys(request.args, new Set(["p_lead_id", "p_review"]), `${label}.args`);
  requiredPositiveInteger(request.args.p_lead_id, `${label}.p_lead_id`);
  assertKeys(request.args.p_review, IMPORT_REVIEW_KEYS, `${label}.p_review`);
  requiredText(
    request.args.p_review.opportunity_type,
    `${label}.opportunity_type`,
  );
  requiredText(request.args.p_review.domain, `${label}.domain`);
  requiredText(request.args.p_review.title, `${label}.title`);
  requiredText(
    request.args.p_review.fallback_fingerprint,
    `${label}.fallback_fingerprint`,
  );
}

function validateVerificationRequest(request, label) {
  assertKeys(request, new Set(["actor", "args"]), label);
  if (!new Set(["a", "b"]).has(request.actor)) {
    throw new Error(`${label}.actor must be a or b`);
  }
  assertKeys(
    request.args,
    new Set(["p_opportunity_id", "p_verification"]),
    `${label}.args`,
  );
  requiredPositiveInteger(
    request.args.p_opportunity_id,
    `${label}.p_opportunity_id`,
  );
  assertKeys(
    request.args.p_verification,
    VERIFICATION_KEYS,
    `${label}.p_verification`,
  );
  requiredText(
    request.args.p_verification.verification_status,
    `${label}.verification_status`,
  );
  requiredText(request.args.p_verification.title, `${label}.title`);
  requiredText(
    request.args.p_verification.official_source_url,
    `${label}.official_source_url`,
  );
}

function sameValue(left, right, label) {
  if (left !== right)
    throw new Error(`${label} must match across both requests`);
}

function validateRaceInvariants(race) {
  const [first, second] = race.requests;
  if (race.name.startsWith("import_")) {
    validateImportRequest(first, `${race.name}.requests[0]`);
    validateImportRequest(second, `${race.name}.requests[1]`);
    const a = first.args.p_review;
    const b = second.args.p_review;
    if (race.name === "import_source_retry") {
      sameValue(
        first.args.p_lead_id,
        second.args.p_lead_id,
        "source retry Lead ID",
      );
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        throw new Error("source retry reviews must be byte-equivalent JSON");
      }
      return;
    }
    if (first.args.p_lead_id === second.args.p_lead_id) {
      throw new Error(`${race.name} requires two different quarantined leads`);
    }
    if (race.name === "import_need_no") {
      sameValue(a.opportunity_type, "inquiry", "Need No opportunity type");
      sameValue(b.opportunity_type, "inquiry", "Need No opportunity type");
      if (a.official_tender_no || b.official_tender_no) {
        throw new Error("Need No race must not supply Tender No");
      }
      sameValue(
        requiredText(a.official_need_no, "first Need No"),
        requiredText(b.official_need_no, "second Need No"),
        "Need No",
      );
    } else if (race.name === "import_tender_no") {
      sameValue(a.opportunity_type, "tender", "Tender No opportunity type");
      sameValue(b.opportunity_type, "tender", "Tender No opportunity type");
      if (a.official_need_no || b.official_need_no) {
        throw new Error("Tender No race must not supply Need No");
      }
      sameValue(
        requiredText(a.official_tender_no, "first Tender No"),
        requiredText(b.official_tender_no, "second Tender No"),
        "Tender No",
      );
    } else {
      if (
        a.official_need_no ||
        a.official_tender_no ||
        b.official_need_no ||
        b.official_tender_no
      ) {
        throw new Error(
          "fingerprint race must not supply an official identifier",
        );
      }
      sameValue(
        a.fallback_fingerprint,
        b.fallback_fingerprint,
        "fallback fingerprint",
      );
    }
    return;
  }

  validateVerificationRequest(first, `${race.name}.requests[0]`);
  validateVerificationRequest(second, `${race.name}.requests[1]`);
  if (first.args.p_opportunity_id === second.args.p_opportunity_id) {
    throw new Error(`${race.name} requires two different opportunities`);
  }
  const a = first.args.p_verification;
  const b = second.args.p_verification;
  sameValue(a.verification_status, "setad_verified", "verification status");
  sameValue(b.verification_status, "setad_verified", "verification status");
  const field =
    race.name === "verify_need_no" ? "official_need_no" : "official_tender_no";
  const forbiddenField =
    race.name === "verify_need_no" ? "official_tender_no" : "official_need_no";
  const officialUrl =
    race.name === "verify_need_no"
      ? "https://eproc.setadiran.ir/eproc/entry.do"
      : "https://etend.setadiran.ir/etend/index.action";
  if (a[forbiddenField] || b[forbiddenField]) {
    throw new Error(`${race.name} contains a type-incompatible identifier`);
  }
  sameValue(a.official_source_url, officialUrl, "official SETAD URL");
  sameValue(b.official_source_url, officialUrl, "official SETAD URL");
  sameValue(
    requiredText(a[field], `first ${field}`),
    requiredText(b[field], `second ${field}`),
    field,
  );
}

export function validateManifest(manifest) {
  assertNoSensitiveKeys(manifest);
  assertKeys(
    manifest,
    new Set(["version", "fixture_namespace", "races"]),
    "manifest",
  );
  if (manifest.version !== MANIFEST_VERSION) {
    throw new Error("Unsupported concurrency manifest version");
  }
  const namespace = requiredText(
    manifest.fixture_namespace,
    "fixture_namespace",
  );
  if (!namespace.startsWith("satno-disposable-")) {
    throw new Error("fixture_namespace must identify disposable data");
  }
  if (
    !Array.isArray(manifest.races) ||
    manifest.races.length !== REQUIRED_CASES.size
  ) {
    throw new Error(
      "Manifest must contain exactly the six required race cases",
    );
  }

  const seen = new Set();
  for (const race of manifest.races) {
    assertKeys(
      race,
      new Set(["name", "rpc", "expectation", "requests"]),
      "race",
    );
    if (!REQUIRED_CASES.has(race.name) || seen.has(race.name)) {
      throw new Error("Manifest contains an unknown or duplicate race case");
    }
    seen.add(race.name);
    if (race.rpc !== RPC_BY_CASE[race.name]) {
      throw new Error(`${race.name} uses the wrong guarded RPC`);
    }
    if (race.expectation !== REQUIRED_CASES.get(race.name)) {
      throw new Error(`${race.name} uses the wrong expectation`);
    }
    if (!Array.isArray(race.requests) || race.requests.length !== 2) {
      throw new Error(`${race.name} requires exactly two requests`);
    }
    if (new Set(race.requests.map((request) => request.actor)).size !== 2) {
      throw new Error(`${race.name} requires actors a and b`);
    }
    validateRaceInvariants(race);
  }
  return manifest;
}

export function loadConfiguration(environment) {
  if (environment.SATNO_TENDER_ACCEPTANCE_CONFIRM !== CONFIRMATION) {
    throw new Error("Disposable-only confirmation is required");
  }
  const rawUrl = requiredText(
    environment.SATNO_TENDER_SUPABASE_URL,
    "SATNO_TENDER_SUPABASE_URL",
  );
  const url = new URL(rawUrl);
  if (
    url.protocol !== "http:" ||
    !new Set(["localhost", "127.0.0.1", "[::1]"]).has(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    throw new Error("Only a credential-free loopback Supabase URL is allowed");
  }

  return {
    baseUrl: url.origin,
    anonKey: requiredText(environment.SATNO_TENDER_ANON_KEY, "anon key"),
    actors: {
      a: requiredText(environment.SATNO_TENDER_USER_A_JWT, "user A JWT"),
      b: requiredText(environment.SATNO_TENDER_USER_B_JWT, "user B JWT"),
    },
    timeoutMs: 15_000,
  };
}

export async function loadManifest(manifestPath, repositoryRoot) {
  if (!manifestPath || !path.isAbsolute(manifestPath)) {
    throw new Error("Manifest path must be explicit and absolute");
  }
  const resolved = path.resolve(manifestPath);
  const root = path.resolve(repositoryRoot);
  const relative = path.relative(root, resolved);
  if (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  ) {
    throw new Error(
      "Concurrency manifest must stay outside the Git repository",
    );
  }
  const raw = await readFile(resolved, "utf8");
  if (raw.length > 262_144)
    throw new Error("Concurrency manifest is too large");
  return validateManifest(JSON.parse(raw));
}

async function rpcRequest({ config, actor, rpc, args, fetchImpl }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  let response;
  try {
    response = await fetchImpl(`${config.baseUrl}/rest/v1/rpc/${rpc}`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.actors[actor]}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      signal: controller.signal,
    });
  } catch {
    throw new Error("Guarded RPC transport failed");
  } finally {
    clearTimeout(timeout);
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 65_536)
    throw new Error("Guarded RPC response is too large");
  const raw = await response.text();
  if (raw.length > 65_536) throw new Error("Guarded RPC response is too large");
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new Error("Guarded RPC returned non-JSON data");
    }
  }
  if (!response.ok) {
    return { kind: payload?.code === "23505" ? "conflict" : "rejected" };
  }
  const row = Array.isArray(payload) ? payload[0] : payload;
  return {
    kind: "accepted",
    duplicate: typeof row?.duplicate === "boolean" ? row.duplicate : null,
    dedupBasis: typeof row?.dedup_basis === "string" ? row.dedup_basis : null,
  };
}

export async function runRaceCase({
  race,
  config,
  fetchImpl = fetch,
  stateInspector = null,
}) {
  await stateInspector?.preflight(race);
  let release;
  const start = new Promise((resolve) => {
    release = resolve;
  });
  const pending = race.requests.map(async (request) => {
    await start;
    return rpcRequest({
      config,
      actor: request.actor,
      rpc: race.rpc,
      args: request.args,
      fetchImpl,
    });
  });
  release();
  const outcomes = await Promise.all(pending);

  if (race.expectation === "single_conflict") {
    const accepted = outcomes.filter(
      (outcome) => outcome.kind === "accepted",
    ).length;
    const conflicts = outcomes.filter(
      (outcome) => outcome.kind === "conflict",
    ).length;
    if (accepted !== 1 || conflicts !== 1) {
      throw new Error(
        `${race.name} did not produce one acceptance and one conflict`,
      );
    }
    await stateInspector?.postcondition(race);
    return {
      name: race.name,
      passed: true,
      outcome: "one_accepted_one_conflict",
      stateVerified: Boolean(stateInspector),
    };
  }

  const accepted = outcomes.filter((outcome) => outcome.kind === "accepted");
  const firstWrites = accepted.filter((outcome) => outcome.duplicate === false);
  const retries = accepted.filter(
    (outcome) => outcome.duplicate === true && outcome.dedupBasis === "lead_id",
  );
  if (
    accepted.length !== 2 ||
    firstWrites.length !== 1 ||
    retries.length !== 1
  ) {
    throw new Error(
      `${race.name} did not produce one write and one idempotent retry`,
    );
  }
  await stateInspector?.postcondition(race);
  return {
    name: race.name,
    passed: true,
    outcome: "one_write_one_idempotent_retry",
    stateVerified: Boolean(stateInspector),
  };
}

export async function runConcurrencyMatrix({
  manifest,
  config,
  fetchImpl = fetch,
  stateInspector = createTenderStateInspector({ config, fetchImpl }),
}) {
  validateManifest(manifest);
  const cases = [];
  for (const race of manifest.races) {
    cases.push(await runRaceCase({ race, config, fetchImpl, stateInspector }));
  }
  return { passed: true, caseCount: cases.length, cases };
}
