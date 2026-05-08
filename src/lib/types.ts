export type CompanyId = "AMET" | "RIHAL" | "PRID" | "PERSONAL";

export const COMPANIES: { id: CompanyId; name: string; tone: string }[] = [
  { id: "AMET", name: "AMET", tone: "amet" },
  { id: "RIHAL", name: "Rihal", tone: "rihal" },
  { id: "PRID", name: "PRID", tone: "prid" },
  { id: "PERSONAL", name: "Personal", tone: "muted" },
];

export type Priority = "P1" | "P2" | "P3" | "P4";

export const PRIORITIES: { id: Priority; label: string; weight: number }[] = [
  { id: "P1", label: "Critical", weight: 4 },
  { id: "P2", label: "High", weight: 3 },
  { id: "P3", label: "Normal", weight: 2 },
  { id: "P4", label: "Low", weight: 1 },
];

export type Status = "todo" | "in_progress" | "blocked" | "done";

export const STATUSES: { id: Status; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

export type Provider = "gmail" | "microsoft";

export interface Task {
  id: number;
  title: string;
  notes: string | null;
  company: CompanyId;
  priority: Priority;
  status: Status;
  due_at: string | null;
  source: "manual" | "email";
  source_provider: Provider | null;
  source_message_id: string | null;
  source_subject: string | null;
  source_sender: string | null;
  source_link: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface EmailAccount {
  id: number;
  provider: Provider;
  email: string;
  display_name: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  default_company: CompanyId;
  last_sync_at: string | null;
  history_token: string | null;
  created_at: string;
}

export interface SyncedMessage {
  id: number;
  account_id: number;
  provider: Provider;
  message_id: string;
  subject: string | null;
  sender: string | null;
  received_at: string | null;
  task_id: number | null;
}
