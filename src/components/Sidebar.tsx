import Link from "next/link";
import { LayoutDashboard, ListChecks, Calendar, Inbox, Settings, Sparkles } from "lucide-react";

const NAV = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/inbox", label: "Email Inbox", icon: Inbox },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-edge bg-panel/60 backdrop-blur-sm sticky top-0 h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 py-1 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amet via-rihal to-prid grid place-items-center text-white font-bold">
          A
        </div>
        <div>
          <div className="font-semibold leading-tight">Activity</div>
          <div className="text-xs text-muted leading-tight">Your assistant</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink/90 hover:bg-panel2 hover:text-ink transition"
            >
              <Icon className="w-4 h-4 text-muted" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto text-xs text-muted px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amet" /> AMET
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-rihal" /> Rihal
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-prid" /> PRID
        </div>
      </div>
    </aside>
  );
}
