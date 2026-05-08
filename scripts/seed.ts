import { createTask } from "../src/lib/tasks";
import { db } from "../src/lib/db";

const existing = db().prepare("SELECT COUNT(*) as n FROM tasks").get() as { n: number };
if (existing.n > 0) {
  console.log(`Database already has ${existing.n} task(s). Skipping seed.`);
  process.exit(0);
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(18, 0, 0, 0);

const samples = [
  { title: "Approve AMET Q2 staffing plan", company: "AMET" as const, priority: "P1" as const, due_at: today.toISOString(), status: "in_progress" as const, notes: "Need final headcount before Friday's leadership review." },
  { title: "Review Rihal product roadmap deck", company: "RIHAL" as const, priority: "P2" as const, due_at: tomorrow.toISOString(), status: "todo" as const },
  { title: "Sign PRID vendor MSA", company: "PRID" as const, priority: "P1" as const, due_at: today.toISOString(), status: "todo" as const, notes: "Legal redlines accepted; just needs signature." },
  { title: "Plan AMET town hall", company: "AMET" as const, priority: "P3" as const, status: "todo" as const },
  { title: "Sync with Rihal engineering lead", company: "RIHAL" as const, priority: "P3" as const, status: "in_progress" as const },
  { title: "Schedule PRID monthly review", company: "PRID" as const, priority: "P2" as const, status: "todo" as const },
  { title: "Refresh personal goals doc", company: "PERSONAL" as const, priority: "P4" as const, status: "todo" as const },
];

for (const s of samples) {
  createTask({ ...s, source: "manual" });
}
console.log(`Seeded ${samples.length} sample tasks across AMET / Rihal / PRID / Personal.`);
