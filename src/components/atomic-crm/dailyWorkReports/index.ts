import { ClipboardList } from "lucide-react";

import type { DailyWorkReport } from "../types";
import { DailyWorkReportCreate } from "./DailyWorkReportCreate";
import { DailyWorkReportEdit } from "./DailyWorkReportEdit";
import { DailyWorkReportList } from "./DailyWorkReportList";

export default {
  create: DailyWorkReportCreate,
  edit: DailyWorkReportEdit,
  icon: ClipboardList,
  list: DailyWorkReportList,
  recordRepresentation: (record: DailyWorkReport) => record.work_date,
};
