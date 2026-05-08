import { listAccounts } from "@/lib/accounts";
import { COMPANIES } from "@/lib/types";
import { ConnectButtons } from "./ConnectButtons";
import { AccountRow } from "./AccountRow";

export const dynamic = "force-dynamic";

export default function SettingsPage({ searchParams }: { searchParams: { connected?: string; error?: string } }) {
  const accounts = listAccounts();
  const googleConfigured = !!process.env.GOOGLE_CLIENT_ID;
  const msConfigured = !!process.env.MS_CLIENT_ID;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted">Connect your email accounts so tasks are created automatically.</p>
      </header>

      {searchParams.connected && (
        <div className="card p-3 border-prid/40 bg-prid/10 text-prid">
          Connected {searchParams.connected} successfully.
        </div>
      )}
      {searchParams.error && (
        <div className="card p-3 border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          {searchParams.error}
        </div>
      )}

      <section className="card p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Email accounts</h2>
          <p className="text-sm text-muted">Each connected mailbox is polled when you click sync.</p>
        </div>

        <ConnectButtons googleConfigured={googleConfigured} msConfigured={msConfigured} />

        {accounts.length === 0 ? (
          <p className="text-sm text-muted">No accounts connected yet.</p>
        ) : (
          <div className="grid gap-2">
            {accounts.map((a) => <AccountRow key={a.id} account={a} />)}
          </div>
        )}
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="text-lg font-semibold">Company defaults</h2>
        <p className="text-sm text-muted">When email content has no company hints, tasks fall back to each account's default company.</p>
        <ul className="text-sm text-muted space-y-1 mt-2">
          {COMPANIES.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${c.id === "AMET" ? "bg-amet" : c.id === "RIHAL" ? "bg-rihal" : c.id === "PRID" ? "bg-prid" : "bg-muted"}`} />
              {c.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="text-lg font-semibold">How auto-routing works</h2>
        <ul className="text-sm text-muted list-disc pl-5 space-y-1">
          <li>Sender domain or subject mentioning <span className="text-amet">AMET</span>, <span className="text-rihal">Rihal</span>, or <span className="text-prid">PRID</span> routes the task to that company.</li>
          <li>Words like "urgent", "asap", "critical", "P1" set priority to P1. "Important", "deadline", "due", "EOD" set P2.</li>
          <li>"Today" / "EOD" sets due to 6pm today; "tomorrow" sets due to 6pm tomorrow.</li>
          <li>Otherwise the email-derived task uses the account's default company at P3 with no due date.</li>
        </ul>
      </section>
    </div>
  );
}
