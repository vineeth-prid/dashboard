import type { CompanyId, Priority } from "./types";

const COMPANY_HINTS: Array<{ company: CompanyId; tokens: RegExp[] }> = [
  {
    company: "AMET",
    tokens: [/\bamet\b/i, /@amet\./i, /\bAMET\b/],
  },
  {
    company: "RIHAL",
    tokens: [/\brihal\b/i, /@rihal\./i],
  },
  {
    company: "PRID",
    tokens: [/\bprid\b/i, /@prid\./i],
  },
];

const URGENT_TOKENS = [
  /\burgent\b/i,
  /\basap\b/i,
  /\bcritical\b/i,
  /\bp1\b/i,
  /\bemergency\b/i,
  /\bblocker\b/i,
];

const HIGH_TOKENS = [/\bimportant\b/i, /\bplease review\b/i, /\bdeadline\b/i, /\bdue\b/i, /\beod\b/i];

export interface RoutingInput {
  sender?: string | null;
  subject?: string | null;
  snippet?: string | null;
  defaultCompany: CompanyId;
}

export interface RoutingResult {
  company: CompanyId;
  priority: Priority;
  due_at: string | null;
}

export function routeEmail(input: RoutingInput): RoutingResult {
  const haystack = [input.sender ?? "", input.subject ?? "", input.snippet ?? ""].join("\n");

  let company: CompanyId = input.defaultCompany;
  for (const hint of COMPANY_HINTS) {
    if (hint.tokens.some((re) => re.test(haystack))) {
      company = hint.company;
      break;
    }
  }

  let priority: Priority = "P3";
  if (URGENT_TOKENS.some((re) => re.test(haystack))) priority = "P1";
  else if (HIGH_TOKENS.some((re) => re.test(haystack))) priority = "P2";

  const due_at = inferDueDate(haystack);

  return { company, priority, due_at };
}

function inferDueDate(text: string): string | null {
  const todayMatch = /\btoday\b/i.test(text);
  const tomorrowMatch = /\btomorrow\b/i.test(text);
  const eodMatch = /\beod\b/i.test(text);

  const now = new Date();
  if (todayMatch || eodMatch) {
    const d = new Date(now);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }
  if (tomorrowMatch) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }
  return null;
}

export function deriveTaskTitle(subject: string | null, sender: string | null): string {
  const cleanSubject = (subject ?? "").replace(/^(re|fwd|fw):\s*/gi, "").trim();
  if (cleanSubject) return cleanSubject;
  if (sender) return `Email from ${sender}`;
  return "New email";
}
