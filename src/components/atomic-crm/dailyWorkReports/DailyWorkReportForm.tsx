import { maxValue, minValue, required } from "ra-core";

import { DateInput } from "@/components/admin/date-input";
import { NumberInput } from "@/components/admin/number-input";
import { TextInput } from "@/components/admin/text-input";

import { today } from "./date";

export const DailyWorkReportForm = () => (
  <div className="grid w-full grid-cols-1 gap-4">
    <DateInput
      source="work_date"
      max={today()}
      validate={required()}
      helperText={false}
    />
    <NumberInput
      source="minutes_worked"
      min={0}
      max={1_440}
      step={15}
      validate={[required(), minValue(0), maxValue(1_440)]}
      helperText="resources.daily_work_reports.minutes_help"
    />
    <TextInput
      source="achievements"
      multiline
      rows={6}
      validate={required()}
      helperText="resources.daily_work_reports.achievements_help"
    />
    <TextInput
      source="blockers"
      multiline
      rows={3}
      helperText="resources.daily_work_reports.blockers_help"
    />
    <TextInput
      source="next_steps"
      multiline
      rows={3}
      helperText="resources.daily_work_reports.next_steps_help"
    />
  </div>
);
