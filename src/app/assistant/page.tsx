import { buildBrief } from "@/lib/assistant";
import { TaskRow } from "@/components/TaskRow";
import { CompanyChip } from "@/components/CompanyChip";
import { Sparkles, AlertTriangle, Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AssistantPage() {
  const brief = buildBrief();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amet via-rihal to-prid grid place-items-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{brief.greeting}, here's your briefing</h1>
          <p className="text-sm text-muted">{brief.summary}</p>
        </div>
      </header>

      <section className="card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h2 className="text-lg font-semibold">Highlights</h2>
        </div>
        <ul className="space-y-1 text-sm">
          {brief.highlights.map((h, i) => (
            <li key={i} className="text-ink/90">• {h}</li>
          ))}
        </ul>
      </section>

      {brief.warnings.length > 0 && (
        <section className="card p-5 space-y-3 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-semibold">Heads up</h2>
          </div>
          <ul className="space-y-1 text-sm text-amber-200/90">
            {brief.warnings.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Suggested focus order</h2>
        {brief.topPicks.length === 0 ? (
          <div className="card p-6 text-center text-muted">No open tasks. Looks clear.</div>
        ) : (
          <div className="grid gap-2">
            {brief.topPicks.map((t) => <TaskRow key={t.id} task={t} />)}
          </div>
        )}
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold">By company</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {brief.byCompany.map(({ company, line }) => (
            <div key={company} className="flex items-center gap-3 p-3 rounded-md bg-panel2 border border-edge">
              <CompanyChip company={company} />
              <div className="text-sm text-muted">{line}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
