function numericIds(values, label) {
  const ids = [...new Set(values)];
  if (
    ids.length === 0 ||
    ids.some((value) => !Number.isSafeInteger(value) || value <= 0)
  ) {
    throw new Error(`${label} contains an invalid fixture ID`);
  }
  return ids;
}

function inFilter(values) {
  return `in.(${values.join(",")})`;
}

function expectedType(race) {
  return race.name.endsWith("need_no") ? "inquiry" : "tender";
}

function targetForRace(race) {
  const request = race.requests[0];
  if (race.name === "import_need_no") {
    return {
      field: "official_need_no",
      value: request.args.p_review.official_need_no,
    };
  }
  if (race.name === "import_tender_no") {
    return {
      field: "official_tender_no",
      value: request.args.p_review.official_tender_no,
    };
  }
  if (race.name === "import_fingerprint") {
    return {
      field: "fallback_fingerprint",
      value: request.args.p_review.fallback_fingerprint,
    };
  }
  if (race.name === "verify_need_no") {
    return {
      field: "official_need_no",
      value: request.args.p_verification.official_need_no,
    };
  }
  if (race.name === "verify_tender_no") {
    return {
      field: "official_tender_no",
      value: request.args.p_verification.official_tender_no,
    };
  }
  return null;
}

function assertCount(rows, expected, label) {
  if (rows.length !== expected) {
    throw new Error(`${label} returned an unexpected row count`);
  }
}

function fixtureError(race, phase, detail) {
  throw new Error(`${race.name} ${phase} ${detail}`);
}

export function createTenderStateInspector({ config, fetchImpl = fetch }) {
  async function readRows(table, columns, filters) {
    const url = new URL(`${config.baseUrl}/rest/v1/${table}`);
    url.searchParams.set("select", columns.join(","));
    for (const [key, value] of Object.entries(filters)) {
      url.searchParams.set(key, value);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    let response;
    try {
      response = await fetchImpl(url, {
        method: "GET",
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.actors.a}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
    } catch {
      throw new Error("Tender state inspection transport failed");
    } finally {
      clearTimeout(timeout);
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 65_536) {
      throw new Error("Tender state inspection response is too large");
    }
    const raw = await response.text();
    if (raw.length > 65_536) {
      throw new Error("Tender state inspection response is too large");
    }
    if (!response.ok) {
      throw new Error("Tender state inspection was rejected");
    }
    let rows;
    try {
      rows = JSON.parse(raw);
    } catch {
      throw new Error("Tender state inspection returned non-JSON data");
    }
    if (!Array.isArray(rows)) {
      throw new Error("Tender state inspection did not return a row set");
    }
    return rows;
  }

  async function readImportState(race) {
    const leadIds = numericIds(
      race.requests.map((request) => request.args.p_lead_id),
      "Lead fixtures",
    );
    const leads = await readRows(
      "lead_inbox",
      ["id", "source", "source_record_id", "status"],
      { id: inFilter(leadIds) },
    );
    const opportunities = await readRows(
      "tender_opportunities",
      [
        "id",
        "lead_id",
        "opportunity_type",
        "official_need_no",
        "official_tender_no",
        "fallback_fingerprint",
        "verification_status",
      ],
      { lead_id: inFilter(leadIds) },
    );
    return { leadIds, leads, opportunities };
  }

  async function readVerificationState(race) {
    const opportunityIds = numericIds(
      race.requests.map((request) => request.args.p_opportunity_id),
      "Opportunity fixtures",
    );
    const opportunities = await readRows(
      "tender_opportunities",
      [
        "id",
        "opportunity_type",
        "official_need_no",
        "official_tender_no",
        "verification_status",
      ],
      { id: inFilter(opportunityIds) },
    );
    const verifications = await readRows(
      "tender_setad_verifications",
      [
        "id",
        "opportunity_id",
        "official_need_no",
        "official_tender_no",
        "verification_status",
      ],
      { opportunity_id: inFilter(opportunityIds) },
    );
    return { opportunityIds, opportunities, verifications };
  }

  async function preflight(race) {
    if (race.name.startsWith("import_")) {
      const state = await readImportState(race);
      assertCount(
        state.leads,
        state.leadIds.length,
        `${race.name} Lead preflight`,
      );
      if (
        state.leads.some(
          (lead) =>
            lead.source !== "tender_radar" ||
            lead.status !== "qualified" ||
            typeof lead.source_record_id !== "string" ||
            lead.source_record_id.trim() === "",
        )
      ) {
        fixtureError(
          race,
          "preflight",
          "requires qualified Tender Radar leads",
        );
      }
      assertCount(
        state.opportunities,
        0,
        `${race.name} clean opportunity preflight`,
      );
      return;
    }

    const state = await readVerificationState(race);
    assertCount(
      state.opportunities,
      state.opportunityIds.length,
      `${race.name} opportunity preflight`,
    );
    const type = expectedType(race);
    if (
      state.opportunities.some(
        (opportunity) =>
          opportunity.opportunity_type !== type ||
          opportunity.verification_status !== "pending_setad_verification" ||
          opportunity.official_need_no !== null ||
          opportunity.official_tender_no !== null,
      )
    ) {
      fixtureError(
        race,
        "preflight",
        "requires clean pending opportunities of the expected type",
      );
    }
    assertCount(
      state.verifications,
      0,
      `${race.name} clean verification preflight`,
    );
  }

  async function verifyImportedState(race) {
    const state = await readImportState(race);
    assertCount(state.opportunities, 1, `${race.name} imported opportunities`);
    const opportunity = state.opportunities[0];
    const target = targetForRace(race);
    if (target && opportunity[target.field] !== target.value) {
      fixtureError(
        race,
        "postcondition",
        "did not preserve the winning identity",
      );
    }

    const pipelines = await readRows(
      "tender_pipeline_entries",
      ["id", "opportunity_id"],
      { opportunity_id: `eq.${opportunity.id}` },
    );
    assertCount(pipelines, 1, `${race.name} initial Pipeline rows`);

    const auditRows = await readRows(
      "tender_audit_log",
      ["id", "opportunity_id", "event_type"],
      { opportunity_id: `eq.${opportunity.id}` },
    );
    const importEvents = auditRows.filter(
      (row) => row.event_type === "radar_lead_imported",
    );
    assertCount(importEvents, 1, `${race.name} import audit events`);
  }

  async function verifyOfficialState(race) {
    const state = await readVerificationState(race);
    assertCount(
      state.opportunities,
      state.opportunityIds.length,
      `${race.name} opportunities after verification`,
    );
    const target = targetForRace(race);
    const winners = state.opportunities.filter(
      (opportunity) =>
        opportunity.verification_status === "setad_verified" &&
        opportunity[target.field] === target.value,
    );
    assertCount(winners, 1, `${race.name} verified opportunities`);
    const losers = state.opportunities.filter(
      (opportunity) => opportunity.id !== winners[0].id,
    );
    if (
      losers.length !== 1 ||
      losers[0].verification_status !== "pending_setad_verification" ||
      losers[0].official_need_no !== null ||
      losers[0].official_tender_no !== null
    ) {
      fixtureError(race, "postcondition", "changed the losing opportunity");
    }

    assertCount(state.verifications, 1, `${race.name} official observations`);
    const verifiedRows = state.verifications.filter(
      (verification) =>
        verification.verification_status === "setad_verified" &&
        verification[target.field] === target.value,
    );
    assertCount(verifiedRows, 1, `${race.name} verified observations`);

    const auditRows = await readRows(
      "tender_audit_log",
      ["id", "opportunity_id", "event_type"],
      { opportunity_id: inFilter(state.opportunityIds) },
    );
    const verificationEvents = auditRows.filter(
      (row) => row.event_type === "setad_verification_recorded",
    );
    assertCount(
      verificationEvents,
      1,
      `${race.name} verification audit events`,
    );
  }

  return {
    preflight,
    async postcondition(race) {
      if (race.name.startsWith("import_")) {
        await verifyImportedState(race);
      } else {
        await verifyOfficialState(race);
      }
    },
  };
}
