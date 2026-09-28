import type { DailyWorkReport } from "../../../types";
import type { Db } from "./types";

export const generateDailyWorkReports = (db: Db): DailyWorkReport[] => [
  {
    achievements:
      "بررسی پیشنهاد پروژه هیبریدی و هماهنگی پیگیری با تیم فروش انجام شد.",
    blockers: "دریافت مشخصات نهایی مصرف‌کننده از مشتری در انتظار است.",
    created_at: "2026-09-27T13:30:00.000Z",
    id: 1,
    minutes_worked: 420,
    next_steps: "تکمیل طراحی اولیه پس از دریافت پروفایل بار.",
    sales_id: db.sales[0]?.id ?? 0,
    work_date: "2026-09-27",
  },
  {
    achievements: "تماس با تأمین‌کنندگان و به‌روزرسانی وضعیت موجودی انجام شد.",
    blockers: "",
    created_at: "2026-09-27T14:00:00.000Z",
    id: 2,
    minutes_worked: 360,
    next_steps: "ثبت قیمت‌های تأییدشده در پیشنهاد فروش.",
    sales_id: db.sales[1]?.id ?? db.sales[0]?.id ?? 0,
    work_date: "2026-09-27",
  },
];
