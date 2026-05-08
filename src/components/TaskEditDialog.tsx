"use client";

import { useTransition } from "react";
import { editTaskAction } from "@/app/actions";
import type { Task } from "@/lib/types";
import { COMPANIES, PRIORITIES, STATUSES } from "@/lib/types";
import { X } from "lucide-react";

export function TaskEditDialog({ task, onClose }: { task: Task; onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  function toLocal(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        action={(fd) => startTransition(async () => { await editTaskAction(fd); onClose(); })}
        className="card w-full max-w-lg p-5 space-y-4"
      >
        <input type="hidden" name="id" value={task.id} />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit task</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <label className="label">Title</label>
          <input className="input w-full" name="title" defaultValue={task.title} required />
        </div>
        <div className="space-y-1">
          <label className="label">Notes</label>
          <textarea className="input w-full min-h-24" name="notes" defaultValue={task.notes ?? ""} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="label">Company</label>
            <select className="input w-full" name="company" defaultValue={task.company}>
              {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="label">Priority</label>
            <select className="input w-full" name="priority" defaultValue={task.priority}>
              {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="label">Status</label>
            <select className="input w-full" name="status" defaultValue={task.status}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="label">Due</label>
          <input className="input w-full" type="datetime-local" name="due_at" defaultValue={toLocal(task.due_at)} />
        </div>

        {task.source === "email" && (
          <div className="text-xs text-muted bg-panel2 border border-edge rounded-md p-3">
            Created from {task.source_provider === "gmail" ? "Gmail" : "Outlook"} —{" "}
            <span className="text-ink">{task.source_subject}</span>
            {task.source_sender && <> · from {task.source_sender}</>}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
