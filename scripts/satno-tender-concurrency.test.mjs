import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  loadConfiguration,
  loadManifest,
  runConcurrencyMatrix,
  runRaceCase,
  validateManifest,
} from "./satno-tender-concurrency-lib.mjs";
import { createTenderStateInspector } from "./satno-tender-concurrency-state.mjs";

const inquiryReview = (overrides = {}) => ({
  opportunity_type: "inquiry",
  domain: "renewable_energy",
  title: "Synthetic disposable inquiry",
  verification_status: "pending_setad_verification",
  radar_score: 95,
  radar_grade: "A",
  fallback_fingerprint: "synthetic-fingerprint-a",
  ...overrides,
});

const tenderReview = (overrides = {}) => ({
  opportunity_type: "tender",
  domain: "security_systems",
  title: "Synthetic disposable tender",
  verification_status: "pending_setad_verification",
  radar_score: 82,
  radar_grade: "B",
  fallback_fingerprint: "synthetic-fingerprint-b",
  ...overrides,
});

const importRace = (
  name,
  firstLead,
  secondLead,
  firstReview,
  secondReview,
  expectation = "single_conflict",
) => ({
  name,
  rpc: "import_tender_opportunity",
  expectation,
  requests: [
    { actor: "a", args: { p_lead_id: firstLead, p_review: firstReview } },
    { actor: "b", args: { p_lead_id: secondLead, p_review: secondReview } },
  ],
});

const verificationRace = (
  name,
  field,
  value,
  firstOpportunity,
  secondOpportunity,
) => {
  const inquiry = field === "official_need_no";
  const verification = {
    verification_status: "setad_verified",
    [field]: value,
    title: "Synthetic official observation",
    official_source_url: inquiry
      ? "https://eproc.setadiran.ir/eproc/entry.do"
      : "https://etend.setadiran.ir/etend/index.action",
  };
  return {
    name,
    rpc: "record_setad_verification",
    expectation: "single_conflict",
    requests: [
      {
        actor: "a",
        args: {
          p_opportunity_id: firstOpportunity,
          p_verification: verification,
        },
      },
      {
        actor: "b",
        args: {
          p_opportunity_id: secondOpportunity,
          p_verification: verification,
        },
      },
    ],
  };
};

function buildManifest() {
  const retry = inquiryReview({ fallback_fingerprint: "source-retry" });
  return {
    version: 1,
    fixture_namespace: "satno-disposable-unit-test",
    races: [
      importRace(
        "import_need_no",
        101,
        102,
        inquiryReview({ official_need_no: "NEED-SYNTHETIC-1" }),
        inquiryReview({ official_need_no: "NEED-SYNTHETIC-1" }),
      ),
      importRace(
        "import_tender_no",
        103,
        104,
        tenderReview({ official_tender_no: "TENDER-SYNTHETIC-1" }),
        tenderReview({ official_tender_no: "TENDER-SYNTHETIC-1" }),
      ),
      importRace(
        "import_source_retry",
        105,
        105,
        retry,
        retry,
        "idempotent_retry",
      ),
      importRace(
        "import_fingerprint",
        106,
        107,
        inquiryReview({ fallback_fingerprint: "shared-fingerprint" }),
        inquiryReview({ fallback_fingerprint: "shared-fingerprint" }),
      ),
      verificationRace(
        "verify_need_no",
        "official_need_no",
        "NEED-SYNTHETIC-2",
        201,
        202,
      ),
      verificationRace(
        "verify_tender_no",
        "official_tender_no",
        "TENDER-SYNTHETIC-2",
        203,
        204,
      ),
    ],
  };
}

const config = {
  baseUrl: "http://127.0.0.1:54321",
  anonKey: "test-anon-key",
  actors: { a: "test-user-a-jwt", b: "test-user-b-jwt" },
  timeoutMs: 1_000,
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("configuration requires an explicit disposable loopback target", () => {
  assert.throws(() => loadConfiguration({}), /confirmation/);
  assert.throws(
    () =>
      loadConfiguration({
        SATNO_TENDER_ACCEPTANCE_CONFIRM: "DISPOSABLE-ONLY",
        SATNO_TENDER_SUPABASE_URL: "https://project.supabase.co",
        SATNO_TENDER_ANON_KEY: "key",
        SATNO_TENDER_USER_A_JWT: "a",
        SATNO_TENDER_USER_B_JWT: "b",
      }),
    /loopback/,
  );
  assert.equal(
    loadConfiguration({
      SATNO_TENDER_ACCEPTANCE_CONFIRM: "DISPOSABLE-ONLY",
      SATNO_TENDER_SUPABASE_URL: "http://127.0.0.1:54321",
      SATNO_TENDER_ANON_KEY: "key",
      SATNO_TENDER_USER_A_JWT: "a",
      SATNO_TENDER_USER_B_JWT: "b",
    }).baseUrl,
    "http://127.0.0.1:54321",
  );
});

test("manifest must remain outside the repository and contain no secret-shaped fields", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "satno-repo-"));
  const inside = path.join(root, "manifest.json");
  await writeFile(inside, JSON.stringify(buildManifest()));
  await assert.rejects(loadManifest(inside, root), /outside/);

  const unsafe = buildManifest();
  unsafe.races[0].requests[0].args.p_review.session_token = "forbidden";
  assert.throws(() => validateManifest(unsafe), /sensitive field/);
});

test("manifest requires every official, source retry and fingerprint race", () => {
  const manifest = buildManifest();
  assert.equal(validateManifest(manifest), manifest);
  manifest.races.pop();
  assert.throws(() => validateManifest(manifest), /six required/);
});

test("single-conflict race accepts exactly one guarded write", async () => {
  const race = buildManifest().races[0];
  let call = 0;
  const result = await runRaceCase({
    race,
    config,
    fetchImpl: async () =>
      call++ === 0
        ? jsonResponse([{ duplicate: false, dedup_basis: "created" }])
        : jsonResponse({ code: "23505", message: "not emitted" }, 400),
  });
  assert.deepEqual(result, {
    name: "import_need_no",
    passed: true,
    outcome: "one_accepted_one_conflict",
    stateVerified: false,
  });
});

test("source retry requires one write and one lead-id idempotent result", async () => {
  const race = buildManifest().races[2];
  let call = 0;
  const result = await runRaceCase({
    race,
    config,
    fetchImpl: async () =>
      jsonResponse([
        call++ === 0
          ? { duplicate: false, dedup_basis: "created" }
          : { duplicate: true, dedup_basis: "lead_id" },
      ]),
  });
  assert.equal(result.outcome, "one_write_one_idempotent_retry");
});

test("requests use separate actor credentials without returning them", async () => {
  const race = buildManifest().races[0];
  const authorizations = [];
  let call = 0;
  const result = await runRaceCase({
    race,
    config,
    fetchImpl: async (url, options) => {
      assert.equal(
        url,
        "http://127.0.0.1:54321/rest/v1/rpc/import_tender_opportunity",
      );
      assert.equal(options.headers.apikey, "test-anon-key");
      authorizations.push(options.headers.Authorization);
      return call++ === 0
        ? jsonResponse([{ duplicate: false, dedup_basis: "created" }])
        : jsonResponse({ code: "23505" }, 400);
    },
  });
  assert.deepEqual(authorizations.sort(), [
    "Bearer test-user-a-jwt",
    "Bearer test-user-b-jwt",
  ]);
  assert.doesNotMatch(JSON.stringify(result), /test-user|test-anon/);
});

test("unexpected dual acceptance fails without returning raw response data", async () => {
  const race = buildManifest().races[0];
  await assert.rejects(
    runRaceCase({
      race,
      config,
      fetchImpl: async () => jsonResponse([{ internal_record_id: 999 }]),
    }),
    (error) => {
      assert.match(error.message, /one acceptance and one conflict/);
      assert.doesNotMatch(error.message, /999|internal_record_id/);
      return true;
    },
  );
});

test("complete matrix uses separate requests and reports only redacted outcomes", async () => {
  const manifest = buildManifest();
  const calls = new Map();
  const inspected = [];
  const result = await runConcurrencyMatrix({
    manifest,
    config,
    stateInspector: {
      async preflight(race) {
        inspected.push(`before:${race.name}`);
      },
      async postcondition(race) {
        inspected.push(`after:${race.name}`);
      },
    },
    fetchImpl: async (url, options) => {
      const rpc = new URL(url).pathname.split("/").at(-1);
      const args = JSON.parse(options.body);
      const key =
        rpc === "import_tender_opportunity"
          ? `lead:${args.p_lead_id}`
          : `opportunity:${args.p_opportunity_id}`;
      const count = calls.get(key) || 0;
      calls.set(key, count + 1);
      if (rpc === "import_tender_opportunity" && args.p_lead_id === 105) {
        return jsonResponse([
          count === 0
            ? { duplicate: false, dedup_basis: "created" }
            : { duplicate: true, dedup_basis: "lead_id" },
        ]);
      }
      const pairKey =
        rpc === "import_tender_opportunity"
          ? args.p_review.official_need_no ||
            args.p_review.official_tender_no ||
            args.p_review.fallback_fingerprint
          : args.p_verification.official_need_no ||
            args.p_verification.official_tender_no;
      const pairCount = calls.get(`pair:${pairKey}`) || 0;
      calls.set(`pair:${pairKey}`, pairCount + 1);
      return pairCount === 0
        ? jsonResponse([{ duplicate: false, dedup_basis: "created" }])
        : jsonResponse({ code: "23505", details: "redacted by runner" }, 400);
    },
  });
  assert.equal(result.passed, true);
  assert.equal(result.caseCount, 6);
  assert.equal(
    result.cases.every((item) => item.stateVerified),
    true,
  );
  assert.equal(inspected.length, 12);
  assert.doesNotMatch(
    JSON.stringify(result),
    /SYNTHETIC|test-user|test-anon|redacted by runner|details/,
  );
});

test("state inspector accepts clean qualified import fixtures", async () => {
  const race = buildManifest().races[0];
  const tables = [];
  const inspector = createTenderStateInspector({
    config,
    fetchImpl: async (url, options) => {
      assert.equal(options.method, "GET");
      assert.equal(options.headers.Authorization, "Bearer test-user-a-jwt");
      const table = url.pathname.split("/").at(-1);
      tables.push(table);
      if (table === "lead_inbox") {
        return jsonResponse([
          {
            id: 101,
            source: "tender_radar",
            source_record_id: "synthetic-a",
            status: "qualified",
          },
          {
            id: 102,
            source: "tender_radar",
            source_record_id: "synthetic-b",
            status: "qualified",
          },
        ]);
      }
      return jsonResponse([]);
    },
  });
  await inspector.preflight(race);
  assert.deepEqual(tables, ["lead_inbox", "tender_opportunities"]);
});

test("state inspector rejects stale import fixtures before mutation", async () => {
  const race = buildManifest().races[0];
  const inspector = createTenderStateInspector({
    config,
    fetchImpl: async (url) => {
      const table = url.pathname.split("/").at(-1);
      if (table === "lead_inbox") {
        return jsonResponse([
          {
            id: 101,
            source: "tender_radar",
            source_record_id: "synthetic-a",
            status: "qualified",
          },
          {
            id: 102,
            source: "tender_radar",
            source_record_id: "synthetic-b",
            status: "qualified",
          },
        ]);
      }
      return jsonResponse([{ id: 999, lead_id: 101 }]);
    },
  });
  await assert.rejects(
    inspector.preflight(race),
    /clean opportunity preflight/,
  );
});

test("state inspector verifies one imported opportunity, Pipeline row and audit", async () => {
  const race = buildManifest().races[0];
  const inspector = createTenderStateInspector({
    config,
    fetchImpl: async (url) => {
      const table = url.pathname.split("/").at(-1);
      if (table === "lead_inbox") {
        return jsonResponse([
          {
            id: 101,
            source: "tender_radar",
            source_record_id: "synthetic-a",
            status: "qualified",
          },
          {
            id: 102,
            source: "tender_radar",
            source_record_id: "synthetic-b",
            status: "qualified",
          },
        ]);
      }
      if (table === "tender_opportunities") {
        return jsonResponse([
          {
            id: 301,
            lead_id: 101,
            opportunity_type: "inquiry",
            official_need_no: "NEED-SYNTHETIC-1",
            official_tender_no: null,
            fallback_fingerprint: "synthetic-fingerprint-a",
            verification_status: "pending_setad_verification",
          },
        ]);
      }
      if (table === "tender_pipeline_entries") {
        return jsonResponse([{ id: 401, opportunity_id: 301 }]);
      }
      if (table === "tender_audit_log") {
        return jsonResponse([
          {
            id: 501,
            opportunity_id: 301,
            event_type: "radar_lead_imported",
          },
        ]);
      }
      throw new Error("Unexpected table");
    },
  });
  await inspector.postcondition(race);
});

test("state inspector preserves the losing official-verification opportunity", async () => {
  const race = buildManifest().races[4];
  let after = false;
  const inspector = createTenderStateInspector({
    config,
    fetchImpl: async (url) => {
      const table = url.pathname.split("/").at(-1);
      if (table === "tender_opportunities") {
        return jsonResponse(
          after
            ? [
                {
                  id: 201,
                  opportunity_type: "inquiry",
                  official_need_no: "NEED-SYNTHETIC-2",
                  official_tender_no: null,
                  verification_status: "setad_verified",
                },
                {
                  id: 202,
                  opportunity_type: "inquiry",
                  official_need_no: null,
                  official_tender_no: null,
                  verification_status: "pending_setad_verification",
                },
              ]
            : [
                {
                  id: 201,
                  opportunity_type: "inquiry",
                  official_need_no: null,
                  official_tender_no: null,
                  verification_status: "pending_setad_verification",
                },
                {
                  id: 202,
                  opportunity_type: "inquiry",
                  official_need_no: null,
                  official_tender_no: null,
                  verification_status: "pending_setad_verification",
                },
              ],
        );
      }
      if (table === "tender_setad_verifications") {
        return jsonResponse(
          after
            ? [
                {
                  id: 601,
                  opportunity_id: 201,
                  official_need_no: "NEED-SYNTHETIC-2",
                  official_tender_no: null,
                  verification_status: "setad_verified",
                },
              ]
            : [],
        );
      }
      if (table === "tender_audit_log") {
        return jsonResponse([
          {
            id: 701,
            opportunity_id: 201,
            event_type: "setad_verification_recorded",
          },
        ]);
      }
      throw new Error("Unexpected table");
    },
  });
  await inspector.preflight(race);
  after = true;
  await inspector.postcondition(race);
});
