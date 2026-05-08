"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTask, deleteTask, updateTask } from "@/lib/tasks";
import { setAccountCompany, deleteAccount } from "@/lib/accounts";
import type { CompanyId, Priority, Status } from "@/lib/types";

const COMPANY = z.enum(["AMET", "RIHAL", "PRID", "PERSONAL"]);
const PRIORITY = z.enum(["P1", "P2", "P3", "P4"]);
const STATUS = z.enum(["todo", "in_progress", "blocked", "done"]);

const CreateSchema = z.object({
  title: z.string().min(1).max(300),
  notes: z.string().max(5000).optional().nullable(),
  company: COMPANY,
  priority: PRIORITY.optional(),
  status: STATUS.optional(),
  due_at: z.string().optional().nullable(),
});

export async function createTaskAction(formData: FormData) {
  const parsed = CreateSchema.parse({
    title: formData.get("title"),
    notes: formData.get("notes") || null,
    company: formData.get("company"),
    priority: formData.get("priority") || "P3",
    status: formData.get("status") || "todo",
    due_at: formData.get("due_at") || null,
  });

  createTask({
    title: parsed.title,
    notes: parsed.notes ?? null,
    company: parsed.company as CompanyId,
    priority: parsed.priority as Priority,
    status: parsed.status as Status,
    due_at: parsed.due_at && parsed.due_at.length > 0 ? new Date(parsed.due_at).toISOString() : null,
  });
  revalidatePath("/");
}

export async function updateTaskStatusAction(id: number, status: Status) {
  updateTask({ id, status });
  revalidatePath("/");
}

export async function updateTaskPriorityAction(id: number, priority: Priority) {
  updateTask({ id, priority });
  revalidatePath("/");
}

export async function updateTaskCompanyAction(id: number, company: CompanyId) {
  updateTask({ id, company });
  revalidatePath("/");
}

const EditSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(300),
  notes: z.string().max(5000).optional().nullable(),
  company: COMPANY,
  priority: PRIORITY,
  status: STATUS,
  due_at: z.string().optional().nullable(),
});

export async function editTaskAction(formData: FormData) {
  const parsed = EditSchema.parse({
    id: formData.get("id"),
    title: formData.get("title"),
    notes: formData.get("notes") || null,
    company: formData.get("company"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    due_at: formData.get("due_at") || null,
  });
  updateTask({
    id: parsed.id,
    title: parsed.title,
    notes: parsed.notes ?? null,
    company: parsed.company as CompanyId,
    priority: parsed.priority as Priority,
    status: parsed.status as Status,
    due_at: parsed.due_at && parsed.due_at.length > 0 ? new Date(parsed.due_at).toISOString() : null,
  });
  revalidatePath("/");
}

export async function deleteTaskAction(id: number) {
  deleteTask(id);
  revalidatePath("/");
}

export async function setAccountCompanyAction(id: number, company: CompanyId) {
  setAccountCompany(id, company);
  revalidatePath("/settings");
}

export async function deleteAccountAction(id: number) {
  deleteAccount(id);
  revalidatePath("/settings");
}
