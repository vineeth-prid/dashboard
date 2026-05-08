"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { CompanyId, EmailAccount } from "@/lib/types";
import { COMPANIES } from "@/lib/types";
import { deleteAccountAction, setAccountCompanyAction } from "@/app/actions";

export function AccountRow({ account }: { account: EmailAccount }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-md grid place-items-center bg-panel2 border border-edge text-xs font-bold">
        {account.provider === "gmail" ? "G" : "M"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{account.email}</div>
        <div className="text-xs text-muted">
          {account.provider === "gmail" ? "Gmail" : "Microsoft 365"}
          {account.last_sync_at && (
            <> · last synced {new Date(account.last_sync_at).toLocaleString()}</>
          )}
        </div>
      </div>
      <select
        className="input"
        value={account.default_company}
        disabled={pending}
        onChange={(e) =>
          startTransition(() => setAccountCompanyAction(account.id, e.target.value as CompanyId))
        }
      >
        {COMPANIES.map((c) => (
          <option key={c.id} value={c.id}>
            Default: {c.name}
          </option>
        ))}
      </select>
      <button
        className="w-9 h-9 grid place-items-center rounded-md text-muted hover:text-red-400 hover:bg-panel2"
        disabled={pending}
        onClick={() => {
          if (confirm(`Disconnect ${account.email}?`)) {
            startTransition(() => deleteAccountAction(account.id));
          }
        }}
        aria-label="Disconnect"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
