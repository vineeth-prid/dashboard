import type { Priority } from "@/lib/types";

const STYLES: Record<Priority, string> = {
  P1: "bg-red-500/15 text-red-400 border-red-500/30",
  P2: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  P3: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  P4: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const LABELS: Record<Priority, string> = {
  P1: "P1 · Critical",
  P2: "P2 · High",
  P3: "P3 · Normal",
  P4: "P4 · Low",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`chip border ${STYLES[priority]}`}>{LABELS[priority]}</span>;
}
