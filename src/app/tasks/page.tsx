import { listTasks } from "@/lib/tasks";
import { TaskRow } from "@/components/TaskRow";
import { QuickCreate } from "@/components/QuickCreate";
import { COMPANIES, PRIORITIES, STATUSES } from "@/lib/types";
import type { CompanyId, Priority, Status } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  company?: string;
  status?: string;
  priority?: string;
  q?: string;
}

export default function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const company = (searchParams.company || "ALL") as CompanyId | "ALL";
  const status = (searchParams.status || "ALL") as Status | "ALL";
  const priority = (searchParams.priority || "ALL") as Priority | "ALL";
  const q = searchParams.q || "";

  const tasks = listTasks({ company, status, priority, q });

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-6xl">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted">Filter and manage your work across companies.</p>
        </div>
      </header>

      <CompanyTabs current={company} />

      <form className="card p-3 flex flex-wrap items-center gap-2" action="/tasks">
        <input type="hidden" name="company" value={company} />
        <input className="input flex-1 min-w-60" name="q" defaultValue={q} placeholder="Search title, notes, sender…" />
        <select className="input" name="status" defaultValue={status}>
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className="input" name="priority" defaultValue={priority}>
          <option value="ALL">All priorities</option>
          {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.label}</option>)}
        </select>
        <button className="btn-primary">Apply</button>
        <Link href="/tasks" className="btn-ghost">Reset</Link>
      </form>

      <QuickCreate defaultCompany={company === "ALL" ? "PERSONAL" : (company as CompanyId)} />

      {tasks.length === 0 ? (
        <div className="card p-8 text-center text-muted">No tasks match these filters.</div>
      ) : (
        <div className="grid gap-2">
          {tasks.map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}

function CompanyTabs({ current }: { current: CompanyId | "ALL" }) {
  const tabs: Array<{ id: CompanyId | "ALL"; label: string; tone: string }> = [
    { id: "ALL", label: "All", tone: "" },
    { id: "AMET", label: "AMET", tone: "amet" },
    { id: "RIHAL", label: "Rihal", tone: "rihal" },
    { id: "PRID", label: "PRID", tone: "prid" },
    { id: "PERSONAL", label: "Personal", tone: "muted" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = current === t.id;
        const colorClass = t.tone === "amet" ? "border-amet/40 text-amet bg-amet/10"
          : t.tone === "rihal" ? "border-rihal/40 text-rihal bg-rihal/10"
          : t.tone === "prid" ? "border-prid/40 text-prid bg-prid/10"
          : "border-edge text-ink bg-panel2";
        return (
          <Link
            key={t.id}
            href={`/tasks?company=${t.id}`}
            className={`px-3 py-1.5 rounded-md text-sm border transition ${active ? colorClass : "border-edge text-muted hover:text-ink hover:bg-panel2"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
