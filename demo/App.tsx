import { CRM } from "@/components/atomic-crm/root/CRM";
import {
  authProvider,
  dataProvider,
} from "@/components/atomic-crm/providers/fakerest";
import { memoryStore } from "ra-core";

const App = () => (
  <>
    <aside
      aria-label="وضعیت نسخه آزمایشی"
      dir="rtl"
      lang="fa"
      className="border-b bg-amber-50 px-4 pt-16 pb-2 text-center md:pt-2 text-sm text-amber-950"
    >
      نسخه نمایشی ساتنو — داده‌ها نمونه و موقت‌اند؛ با بازخوانی صفحه، تغییرات
      پاک می‌شوند. اطلاعات واقعی وارد نکنید. اتصال زنده به بله و ستاد برقرار
      نیست.
    </aside>
    <CRM
      title="ساتنو CRM"
      disableTelemetry
      dataProvider={dataProvider}
      authProvider={authProvider}
      store={memoryStore()}
    />
  </>
);

export default App;
