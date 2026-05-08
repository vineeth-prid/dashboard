import type { Status } from "@/lib/types";

const STYLES: Record<Status, string> = {
  todo: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  in_progress: "bg-amet/15 text-amet border-amet/30",
  blocked: "bg-red-500/15 text-red-400 border-red-500/30",
  done: "bg-prid/15 text-prid border-prid/30",
};

const LABELS: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`chip border ${STYLES[status]}`}>{LABELS[status]}</span>;
}
