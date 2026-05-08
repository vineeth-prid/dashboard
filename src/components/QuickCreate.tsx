"use client";

import { useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTaskAction } from "@/app/actions";
import { COMPANIES, PRIORITIES } from "@/lib/types";
import type { CompanyId } from "@/lib/types";

export function QuickCreate({ defaultCompany = "PERSONAL" }: { defaultCompany?: CompanyId }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await createTaskAction(fd);
          formRef.current?.reset();
        })
      }
      className="card p-3 flex flex-wrap items-center gap-2"
    >
      <input
        className="input flex-1 min-w-60"
        name="title"
        placeholder="What needs doing? (e.g. Review Rihal proposal by tomorrow)"
        required
      />
      <select className="input" name="company" defaultValue={defaultCompany}>
        {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select className="input" name="priority" defaultValue="P3">
        {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
      </select>
      <input className="input" name="due_at" type="datetime-local" />
      <button className="btn-primary" disabled={pending}>
        <Plus className="w-4 h-4" />
        {pending ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}
