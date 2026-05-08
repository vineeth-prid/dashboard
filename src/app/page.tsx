import Link from "next/link";
import { listTasks, getStats } from "@/lib/tasks";
import { StatCard } from "@/components/StatCard";
import { TaskRow } from "@/components/TaskRow";
import { QuickCreate } from "@/components/QuickCreate";
import { COMPANIES } from "@/lib/types";
import type { CompanyId, Task } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Working late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const stats = getStats();
  const tasks = listTasks({ status: "ALL" });
  const today = new Date().toISOString().slice(0, 10);

  const todaysTasks = tasks.filter((t) => {
    if (t.status === "done") return false;
    if (t.due_at && t.due_at.slice(0, 10) <= today) return true;
    if (t.priority === "P1" || t.priority === "P2") return true;
    return false;
  }).slice(0, 12);

  const inProgress = tasks.filter((t) => t.status === "in_progress").slice(0, 5);
  const recentEmailTasks = tasks.filter((t) => t.source === "email").slice(0, 5);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <header className="space-y-1">
        <div className="text-sm text-muted">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 className="text-2xl font-semibold">{greeting()} — here's your day</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Open tasks" value={stats.open} />
        <StatCard label="Done today" value={stats.done_today} tone="prid" />
        <StatCard label="Overdue" value={stats.overdue} tone="danger" hint={stats.overdue > 0 ? "Needs attention" : "All clear"} />
        <StatCard label="P1 critical" value={stats.by_priority.P1} tone={stats.by_priority.P1 > 0 ? "danger" : "default"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["AMET", "RIHAL", "PRID"] as CompanyId[]).map((id) => {
          const c = COMPANIES.find((x) => x.id === id)!;
          const counts = stats.by_company[id];
          return (
            <Link
              key={id}
              href={`/tasks?company=${id}`}
              className={`card card-hover p-4 flex items-center justify-between`}
            >
              <div>
                <div className={`text-xs uppercase tracking-wider ${id === "AMET" ? "text-amet" : id === "RIHAL" ? "text-rihal" : "text-prid"}`}>
                  {c.name}
                </div>
                <div className="text-2xl font-semibold mt-1">{counts.open} open</div>
                <div className="text-xs text-muted">{counts.done} completed</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted" />
            </Link>
          );
        })}
      </div>

      <QuickCreate />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Focus for today</h2>
          <Link href="/tasks" className="text-xs text-muted hover:text-ink">See all →</Link>
        </div>
        {todaysTasks.length === 0 ? (
          <div className="card p-6 text-center text-muted">Nothing pressing — enjoy a clear day.</div>
        ) : (
          <div className="grid gap-2">
            {todaysTasks.map((t: Task) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">In progress</h2>
          {inProgress.length === 0 ? (
            <div className="card p-4 text-sm text-muted">Nothing in progress.</div>
          ) : (
            <div className="grid gap-2">{inProgress.map((t) => <TaskRow key={t.id} task={t} />)}</div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent from inbox</h2>
          {recentEmailTasks.length === 0 ? (
            <div className="card p-4 text-sm text-muted">
              No email-sourced tasks yet. Connect Gmail or Outlook in <Link href="/settings" className="underline">Settings</Link>.
            </div>
          ) : (
            <div className="grid gap-2">{recentEmailTasks.map((t) => <TaskRow key={t.id} task={t} />)}</div>
          )}
        </section>
      </div>
    </div>
  );
}
