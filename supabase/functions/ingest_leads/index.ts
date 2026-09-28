import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { createLeadIngestionHandler } from "./handler.ts";
import { createIdempotentLeadStore } from "./store.ts";

const SELECTED_FIELDS = "id, source, source_record_id, status, created_at";

const store = createIdempotentLeadStore({
  async insert(lead) {
    return await supabaseAdmin
      .from("lead_inbox")
      .insert(lead)
      .select(SELECTED_FIELDS)
      .single();
  },
  async findBySourceKey(source, sourceRecordId) {
    return await supabaseAdmin
      .from("lead_inbox")
      .select(SELECTED_FIELDS)
      .eq("source", source)
      .eq("source_record_id", sourceRecordId)
      .single();
  },
});

const handler = createLeadIngestionHandler({
  getEnv: (name) => Deno.env.get(name),
  store,
});

Deno.serve(handler);
