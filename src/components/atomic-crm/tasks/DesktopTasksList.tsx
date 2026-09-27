import { CheckSquare } from "lucide-react";
import { useTranslate } from "ra-core";

import { Card } from "@/components/ui/card";

import { AddTask } from "./AddTask";
import { TasksListContent } from "./TasksListContent";

export const DesktopTasksList = () => {
  const translate = useTranslate();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center gap-3">
        <CheckSquare className="text-muted-foreground size-6" />
        <h1 className="flex-1 text-2xl font-semibold">
          {translate("resources.tasks.name", { smart_count: 2 })}
        </h1>
        <AddTask display="icon" selectContact />
      </header>
      <Card className="p-4">
        <TasksListContent />
      </Card>
    </main>
  );
};
