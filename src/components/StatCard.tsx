export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "amet" | "rihal" | "prid" | "danger";
}) {
  const toneClasses: Record<string, string> = {
    default: "text-ink",
    amet: "text-amet",
    rihal: "text-rihal",
    prid: "text-prid",
    danger: "text-red-400",
  };
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className={`text-3xl font-semibold mt-1 ${toneClasses[tone]}`}>{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}
