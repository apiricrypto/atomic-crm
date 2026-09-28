import { email, required, useGetIdentity, useRecordContext } from "ra-core";
import { BooleanInput } from "@/components/admin/boolean-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";

import { STAFF_ROLES, resolveStaffRole } from "../providers/commons/staffRoles";
import type { Sale } from "../types";
import { normalizePhoneNumber } from "../login/phoneOtp";

const validatePhone = (value?: string) =>
  !value || normalizePhoneNumber(value) ? undefined : "crm.auth.phone_invalid";

export function SalesInputs() {
  const { identity } = useGetIdentity();
  const record = useRecordContext<Sale>();
  return (
    <div className="space-y-4 w-full">
      <TextInput source="first_name" validate={required()} helperText={false} />
      <TextInput source="last_name" validate={required()} helperText={false} />
      <TextInput
        source="email"
        validate={[required(), email()]}
        helperText={false}
      />
      <TextInput
        source="phone"
        type="tel"
        validate={validatePhone}
        helperText="resources.sales.phone_help"
      />
      <SelectInput
        source="role"
        choices={STAFF_ROLES.map((role) => ({
          id: role,
          name: `resources.sales.roles.${role}`,
        }))}
        format={(value) => value || resolveStaffRole(record ?? {})}
        translateChoice
        readOnly={record?.id === identity?.id}
        helperText={false}
      />
      <BooleanInput
        source="disabled"
        readOnly={record?.id === identity?.id}
        helperText={false}
      />
    </div>
  );
}
