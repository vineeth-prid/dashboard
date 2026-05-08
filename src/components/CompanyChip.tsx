import type { CompanyId } from "@/lib/types";

const STYLES: Record<CompanyId, string> = {
  AMET: "bg-amet/15 text-amet border-amet/30",
  RIHAL: "bg-rihal/15 text-rihal border-rihal/30",
  PRID: "bg-prid/15 text-prid border-prid/30",
  PERSONAL: "bg-muted/15 text-muted border-muted/30",
};

const LABELS: Record<CompanyId, string> = {
  AMET: "AMET",
  RIHAL: "Rihal",
  PRID: "PRID",
  PERSONAL: "Personal",
};

export function CompanyChip({ company, className = "" }: { company: CompanyId; className?: string }) {
  return (
    <span className={`chip border ${STYLES[company]} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {LABELS[company]}
    </span>
  );
}
