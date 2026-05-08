import { db } from "./db";
import type { CompanyId, Priority, Status, Task, Provider } from "./types";

export interface TaskFilters {
  company?: CompanyId | "ALL";
  status?: Status | "ALL";
  priority?: Priority | "ALL";
  q?: string;
}

export function listTasks(filters: TaskFilters = {}): Task[] {
  const where: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.company && filters.company !== "ALL") {
    where.push("company = @company");
    params.company = filters.company;
  }
  if (filters.status && filters.status !== "ALL") {
    where.push("status = @status");
    params.status = filters.status;
  }
  if (filters.priority && filters.priority !== "ALL") {
    where.push("priority = @priority");
    params.priority = filters.priority;
  }
  if (filters.q) {
    where.push("(title LIKE @q OR notes LIKE @q OR source_subject LIKE @q OR source_sender LIKE @q)");
    params.q = `%${filters.q}%`;
  }

  const sql = `
    SELECT * FROM tasks
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY
      CASE status WHEN 'in_progress' THEN 0 WHEN 'todo' THEN 1 WHEN 'blocked' THEN 2 ELSE 3 END,
      CASE priority WHEN 'P1' THEN 0 WHEN 'P2' THEN 1 WHEN 'P3' THEN 2 ELSE 3 END,
      COALESCE(due_at, '9999-12-31') ASC,
      created_at DESC
  `;

  return db().prepare(sql).all(params) as Task[];
}

export interface CreateTaskInput {
  title: string;
  notes?: string | null;
  company: CompanyId;
  priority?: Priority;
  status?: Status;
  due_at?: string | null;
  source?: "manual" | "email";
  source_provider?: Provider | null;
  source_message_id?: string | null;
  source_subject?: string | null;
  source_sender?: string | null;
  source_link?: string | null;
}

export function createTask(input: CreateTaskInput): Task {
  const stmt = db().prepare(`
    INSERT INTO tasks (
      title, notes, company, priority, status, due_at,
      source, source_provider, source_message_id, source_subject, source_sender, source_link
    ) VALUES (
      @title, @notes, @company, @priority, @status, @due_at,
      @source, @source_provider, @source_message_id, @source_subject, @source_sender, @source_link
    )
  `);
  const info = stmt.run({
    title: input.title,
    notes: input.notes ?? null,
    company: input.company,
    priority: input.priority ?? "P3",
    status: input.status ?? "todo",
    due_at: input.due_at ?? null,
    source: input.source ?? "manual",
    source_provider: input.source_provider ?? null,
    source_message_id: input.source_message_id ?? null,
    source_subject: input.source_subject ?? null,
    source_sender: input.source_sender ?? null,
    source_link: input.source_link ?? null,
  });
  return db().prepare("SELECT * FROM tasks WHERE id = ?").get(info.lastInsertRowid) as Task;
}

export interface UpdateTaskInput {
  id: number;
  title?: string;
  notes?: string | null;
  company?: CompanyId;
  priority?: Priority;
  status?: Status;
  due_at?: string | null;
}

export function updateTask(input: UpdateTaskInput): Task {
  const fields: string[] = [];
  const params: Record<string, unknown> = { id: input.id };

  for (const key of ["title", "notes", "company", "priority", "status", "due_at"] as const) {
    if (input[key] !== undefined) {
      fields.push(`${key} = @${key}`);
      params[key] = input[key];
    }
  }
  if (input.status === "done") {
    fields.push("completed_at = datetime('now')");
  } else if (input.status && input.status !== "done") {
    fields.push("completed_at = NULL");
  }
  fields.push("updated_at = datetime('now')");

  db().prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = @id`).run(params);
  return db().prepare("SELECT * FROM tasks WHERE id = ?").get(input.id) as Task;
}

export function deleteTask(id: number): void {
  db().prepare("DELETE FROM tasks WHERE id = ?").run(id);
}

export interface DashboardStats {
  total: number;
  open: number;
  done_today: number;
  overdue: number;
  by_company: Record<CompanyId, { open: number; done: number }>;
  by_priority: Record<Priority, number>;
}

export function getStats(): DashboardStats {
  const rows = db().prepare(`SELECT company, status, priority, due_at, completed_at FROM tasks`).all() as Array<{
    company: CompanyId;
    status: Status;
    priority: Priority;
    due_at: string | null;
    completed_at: string | null;
  }>;

  const stats: DashboardStats = {
    total: rows.length,
    open: 0,
    done_today: 0,
    overdue: 0,
    by_company: {
      AMET: { open: 0, done: 0 },
      RIHAL: { open: 0, done: 0 },
      PRID: { open: 0, done: 0 },
      PERSONAL: { open: 0, done: 0 },
    },
    by_priority: { P1: 0, P2: 0, P3: 0, P4: 0 },
  };

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  for (const r of rows) {
    if (r.status !== "done") {
      stats.open++;
      stats.by_company[r.company].open++;
      stats.by_priority[r.priority]++;
      if (r.due_at && new Date(r.due_at) < now) stats.overdue++;
    } else {
      stats.by_company[r.company].done++;
      if (r.completed_at && r.completed_at.startsWith(today)) stats.done_today++;
    }
  }
  return stats;
}
