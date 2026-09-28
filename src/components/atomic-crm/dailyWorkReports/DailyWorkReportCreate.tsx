import { CreateBase, Form, useGetIdentity, useTranslate } from "ra-core";

import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DailyWorkReportForm } from "./DailyWorkReportForm";
import { today } from "./date";

export const DailyWorkReportCreate = () => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();

  return (
    <CreateBase
      redirect="list"
      transform={(values) => ({
        ...values,
        blockers: values.blockers ?? "",
        created_at: new Date().toISOString(),
        next_steps: values.next_steps ?? "",
        sales_id: identity?.id,
      })}
    >
      <div className="mx-auto mt-2 w-full max-w-2xl px-4 pb-20 md:px-0 md:pb-0">
        <Form
          defaultValues={{
            blockers: "",
            minutes_worked: 0,
            next_steps: "",
            sales_id: identity?.id,
            work_date: today(),
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {translate("resources.daily_work_reports.create_title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyWorkReportForm />
              <div className="flex justify-end gap-2 pt-4">
                <CancelButton />
                <SaveButton />
              </div>
            </CardContent>
          </Card>
        </Form>
      </div>
    </CreateBase>
  );
};
