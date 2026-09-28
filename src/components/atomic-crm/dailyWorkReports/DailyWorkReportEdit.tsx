import {
  EditBase,
  Form,
  useGetIdentity,
  useRecordContext,
  useTranslate,
} from "ra-core";

import { CancelButton } from "@/components/admin/cancel-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { SaveButton } from "@/components/admin/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DailyWorkReport } from "../types";
import { DailyWorkReportForm } from "./DailyWorkReportForm";

export const DailyWorkReportEdit = () => (
  <EditBase redirect="list" mutationMode="pessimistic">
    <OwnerReportForm />
  </EditBase>
);

const OwnerReportForm = () => {
  const record = useRecordContext<DailyWorkReport>();
  const { identity } = useGetIdentity();
  const translate = useTranslate();

  if (!record) return null;

  if (String(record.sales_id) !== String(identity?.id)) {
    return (
      <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-destructive/40 p-6 text-center text-destructive">
        {translate("resources.daily_work_reports.owner_only")}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-2 w-full max-w-2xl px-4 pb-20 md:px-0 md:pb-0">
      <Form>
        <Card>
          <CardHeader>
            <CardTitle>
              {translate("resources.daily_work_reports.edit_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyWorkReportForm />
            <div className="flex flex-wrap justify-between gap-2 pt-4">
              <DeleteButton redirect="list" />
              <div className="flex gap-2">
                <CancelButton />
                <SaveButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </Form>
    </div>
  );
};
