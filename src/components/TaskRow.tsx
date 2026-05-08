"use client";

import { useState, useTransition } from "react";
import { Check, Circle, Clock, AlertTriangle, Trash2, Mail, Pencil } from "lucide-react";
import { CompanyChip } from "./CompanyChip";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import {
  deleteTaskAction,
  updateTaskCompanyAction,
  updateTaskPriorityAction,
  updateTaskStatusAction,
} from "@/app/actions";
import type { CompanyId, Priority, Status, Task } from "@/lib/types";
import { COMPANIES, PRIORITIES, STATUSES } from "@/lib/types";
import { TaskEditDialog } from "./TaskEditDialog";

const STATUS_ICON: Record<Status, React.ComponentType<{ className?: string }>> = {
  todo: Circle,
  in_progress: Clock,
  blocked: AlertTriangle,
  done: Check,
};

export function TaskRow({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const Icon = STATUS_ICON[task.status];

  const overdue =
    task.due_at && task.status !== "done" && new Date(task.due_at).getTime() < Date.now();

  const cycleStatus = () => {
    const order: Status[] = ["todo", "in_progress", "blocked", "done"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    startTransition(() => updateTaskStatusAction(task.id, next));
  };

  return (
    <>
      <div
        className={`card card-hover p-3 flex items-start gap-3 ${pending ? "opacity-60" : ""} ${
          task.status === "done" ? "opacity-70" : ""
        }`}
      >
        <button
          onClick={cycleStatus}
          aria-label="Cycle status"
          className={`mt-0.5 w-7 h-7 grid place-items-center rounded-md border border-edge bg-panel2 hover:bg-edge transition ${
            task.status === "done" ? "text-prid" : task.status === "in_progress" ? "text-amet" : task.status === "blocked" ? "text-red-400" : "text-muted"
          }`}
        >
          <Icon className="w-4 h-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 flex-wrap">
            <div
              className={`font-medium text-sm leading-snug ${
                task.status === "done" ? "line-through text-muted" : "text-ink"
              }`}
            >
              {task.title}
            </div>
            {task.source === "email" && (
              <span className="chip border bg-panel2 border-edge text-muted">
                <Mail className="w-3 h-3" />
                {task.source_provider === "gmail" ? "Gmail" : "Outlook"}
              </span>
            )}
          </div>

          {task.notes && <div className="text-xs text-muted mt-1 line-clamp-2">{task.notes}</div>}
          {task.source === "email" && task.source_sender && (
            <div className="text-xs text-muted mt-1 truncate">From {task.source_sender}</div>
          )}

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <CompanySelect
              value={task.company}
              onChange={(c) => startTransition(() => updateTaskCompanyAction(task.id, c))}
            />
            <PrioritySelect
              value={task.priority}
              onChange={(p) => startTransition(() => updateTaskPriorityAction(task.id, p))}
            />
            <StatusSelect
              value={task.status}
              onChange={(s) => startTransition(() => updateTaskStatusAction(task.id, s))}
            />
            {task.due_at && (
              <span
                className={`chip border ${
                  overdue
                    ? "border-red-500/40 bg-red-500/10 text-red-400"
                    : "border-edge bg-panel2 text-muted"
                }`}
              >
                <Clock className="w-3 h-3" />
                {new Date(task.due_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(true)}
            className="w-8 h-8 grid place-items-center rounded-md text-muted hover:text-ink hover:bg-panel2"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this task?")) startTransition(() => deleteTaskAction(task.id));
            }}
            className="w-8 h-8 grid place-items-center rounded-md text-muted hover:text-red-400 hover:bg-panel2"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && <TaskEditDialog task={task} onClose={() => setOpen(false)} />}
    </>
  );
}

function CompanySelect({ value, onChange }: { value: CompanyId; onChange: (c: CompanyId) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CompanyId)}
      className="chip border border-edge bg-panel2 text-ink hover:border-edge/80"
    >
      {COMPANIES.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}

function PrioritySelect({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      className="chip border border-edge bg-panel2 text-ink"
    >
      {PRIORITIES.map((p) => (
        <option key={p.id} value={p.id}>{p.id} · {p.label}</option>
      ))}
    </select>
  );
}

function StatusSelect({ value, onChange }: { value: Status; onChange: (s: Status) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Status)}
      className="chip border border-edge bg-panel2 text-ink"
    >
      {STATUSES.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
