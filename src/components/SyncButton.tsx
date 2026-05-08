"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function SyncButton({ label = "Sync emails" }: { label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setPending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Sync failed");
      const total = data.results.reduce((acc: number, r: { created: number }) => acc + r.created, 0);
      setMsg(total === 0 ? "No new emails." : `Created ${total} task${total === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={run} disabled={pending} className="btn-primary">
        <RefreshCw className={`w-4 h-4 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Syncing…" : label}
      </button>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  );
}
