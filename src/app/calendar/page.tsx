import { listTasks } from "@/lib/tasks";
import { CompanyChip } from "@/components/CompanyChip";
import { PriorityBadge } from "@/components/PriorityBadge";
import type { Task } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  const tasks = listTasks().filter((t) => t.due_at && t.status !== "done");

  const groups: Record<string, Task[]> = {};
  for (const t of tasks) {
    const key = t.due_at!.slice(0, 10);
    (groups[key] ||= []).push(t);
  }
  const keys = Object.keys(groups).sort();

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted">Tasks with a scheduled due date.</p>
      </header>

      {keys.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          No scheduled tasks. <Link href="/tasks" className="underline">Add a due date.</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {keys.map((day) => (
            <section key={day}>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
                {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              <div className="grid gap-2">
                {groups[day]
                  .sort((a, b) => (a.due_at! < b.due_at! ? -1 : 1))
                  .map((t) => (
                    <div key={t.id} className="card p-3 flex items-center gap-3">
                      <div className="text-sm tabular-nums text-muted w-16">
                        {new Date(t.due_at!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{t.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <CompanyChip company={t.company} />
                          <PriorityBadge priority={t.priority} />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
