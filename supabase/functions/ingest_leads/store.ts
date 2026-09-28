import type { LeadInsert } from "./contract.ts";
import type { LeadStore, StoredLead } from "./handler.ts";

type DatabaseError = { code?: string };
type DatabaseResult = {
  data: StoredLead | null;
  error: DatabaseError | null;
};

type StoreOperations = {
  insert: (lead: LeadInsert) => Promise<DatabaseResult>;
  findBySourceKey: (
    source: LeadInsert["source"],
    sourceRecordId: string,
  ) => Promise<DatabaseResult>;
};

export function createIdempotentLeadStore({
  findBySourceKey,
  insert,
}: StoreOperations): LeadStore {
  return {
    async insert(lead) {
      const created = await insert(lead);
      if (!created.error && created.data) {
        return { duplicate: false, record: created.data };
      }
      if (created.error?.code !== "23505") {
        throw created.error ?? new Error("Lead insert returned no record");
      }

      const existing = await findBySourceKey(
        lead.source,
        lead.source_record_id,
      );
      if (existing.error || !existing.data) {
        throw existing.error ?? new Error("Duplicate lead lookup failed");
      }
      return { duplicate: true, record: existing.data };
    },
  };
}
