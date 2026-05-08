import Link from "next/link";
import { listTasks } from "@/lib/tasks";
import { listAccounts } from "@/lib/accounts";
import { TaskRow } from "@/components/TaskRow";
import { SyncButton } from "@/components/SyncButton";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  const accounts = listAccounts();
  const emailTasks = listTasks().filter((t) => t.source === "email");

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-5xl">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Email Inbox</h1>
          <p className="text-sm text-muted">Tasks created from Gmail and Outlook.</p>
        </div>
        {accounts.length > 0 && <SyncButton />}
      </header>

      {accounts.length === 0 ? (
        <div className="card p-8 text-center space-y-3">
          <Mail className="w-8 h-8 text-muted mx-auto" />
          <h2 className="text-lg font-medium">No email accounts connected</h2>
          <p className="text-sm text-muted">
            Connect Gmail or Outlook in <Link href="/settings" className="underline">Settings</Link> to start auto-creating tasks from email.
          </p>
        </div>
      ) : emailTasks.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          No email tasks yet — hit <span className="text-ink">Sync emails</span> to pull recent messages.
        </div>
      ) : (
        <div className="grid gap-2">
          {emailTasks.map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}
