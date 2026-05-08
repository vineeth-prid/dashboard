import { listTasks } from "./tasks";
import type { CompanyId, Task } from "./types";

export interface Brief {
  greeting: string;
  summary: string;
  highlights: string[];
  byCompany: Array<{ company: CompanyId; line: string }>;
  topPicks: Task[];
  warnings: string[];
}

function priorityWeight(t: Task): number {
  const base = t.priority === "P1" ? 100 : t.priority === "P2" ? 70 : t.priority === "P3" ? 40 : 20;
  let mod = 0;
  if (t.due_at) {
    const ms = new Date(t.due_at).getTime() - Date.now();
    const hours = ms / 36e5;
    if (hours < 0) mod += 30;
    else if (hours < 24) mod += 20;
    else if (hours < 72) mod += 10;
  }
  if (t.status === "in_progress") mod += 10;
  if (t.status === "blocked") mod -= 5;
  return base + mod;
}

export function buildBrief(): Brief {
  const tasks = listTasks();
  const open = tasks.filter((t) => t.status !== "done");
  const overdue = open.filter((t) => t.due_at && new Date(t.due_at).getTime() < Date.now());
  const blocked = open.filter((t) => t.status === "blocked");

  const ranked = [...open].sort((a, b) => priorityWeight(b) - priorityWeight(a));
  const topPicks = ranked.slice(0, 5);

  const byCompanyMap: Record<string, { open: number; p1: number; overdue: number }> = {};
  for (const t of open) {
    const c = t.company;
    byCompanyMap[c] ||= { open: 0, p1: 0, overdue: 0 };
    byCompanyMap[c].open++;
    if (t.priority === "P1") byCompanyMap[c].p1++;
    if (t.due_at && new Date(t.due_at).getTime() < Date.now()) byCompanyMap[c].overdue++;
  }
  const byCompany = (Object.keys(byCompanyMap) as CompanyId[]).map((company) => {
    const c = byCompanyMap[company];
    let line = `${c.open} open`;
    if (c.p1) line += ` · ${c.p1} P1`;
    if (c.overdue) line += ` · ${c.overdue} overdue`;
    return { company, line };
  });

  const highlights: string[] = [];
  if (overdue.length) highlights.push(`${overdue.length} task${overdue.length === 1 ? "" : "s"} overdue.`);
  const p1 = open.filter((t) => t.priority === "P1").length;
  if (p1) highlights.push(`${p1} critical (P1) item${p1 === 1 ? "" : "s"} need attention.`);
  if (blocked.length) highlights.push(`${blocked.length} task${blocked.length === 1 ? "" : "s"} blocked — consider unblocking.`);
  if (highlights.length === 0) highlights.push("Nothing urgent. Good time to plan deep work.");

  const warnings: string[] = [];
  for (const c of ["AMET", "RIHAL", "PRID"] as CompanyId[]) {
    const stats = byCompanyMap[c];
    if (stats && stats.p1 >= 2) {
      warnings.push(`${c} has ${stats.p1} P1 items — consider escalating or delegating.`);
    }
  }

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const summary = `You have ${open.length} open task${open.length === 1 ? "" : "s"} across your three companies.`;

  return { greeting, summary, highlights, byCompany, topPicks, warnings };
}
