import { db } from "./db";
import type { CompanyId, EmailAccount, Provider } from "./types";

export function listAccounts(): EmailAccount[] {
  return db().prepare("SELECT * FROM email_accounts ORDER BY provider, email").all() as EmailAccount[];
}

export function getAccount(id: number): EmailAccount | undefined {
  return db().prepare("SELECT * FROM email_accounts WHERE id = ?").get(id) as EmailAccount | undefined;
}

export interface UpsertAccountInput {
  provider: Provider;
  email: string;
  display_name?: string | null;
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  default_company?: CompanyId;
}

export function upsertAccount(input: UpsertAccountInput): EmailAccount {
  const existing = db()
    .prepare("SELECT id FROM email_accounts WHERE provider = ? AND email = ?")
    .get(input.provider, input.email) as { id: number } | undefined;

  if (existing) {
    db().prepare(`
      UPDATE email_accounts
      SET access_token = @access_token,
          refresh_token = COALESCE(@refresh_token, refresh_token),
          token_expires_at = @token_expires_at,
          display_name = COALESCE(@display_name, display_name),
          default_company = COALESCE(@default_company, default_company)
      WHERE id = @id
    `).run({
      id: existing.id,
      access_token: input.access_token,
      refresh_token: input.refresh_token ?? null,
      token_expires_at: input.token_expires_at ?? null,
      display_name: input.display_name ?? null,
      default_company: input.default_company ?? null,
    });
    return getAccount(existing.id)!;
  }

  const info = db().prepare(`
    INSERT INTO email_accounts (provider, email, display_name, access_token, refresh_token, token_expires_at, default_company)
    VALUES (@provider, @email, @display_name, @access_token, @refresh_token, @token_expires_at, @default_company)
  `).run({
    provider: input.provider,
    email: input.email,
    display_name: input.display_name ?? null,
    access_token: input.access_token,
    refresh_token: input.refresh_token ?? null,
    token_expires_at: input.token_expires_at ?? null,
    default_company: input.default_company ?? "PERSONAL",
  });
  return getAccount(Number(info.lastInsertRowid))!;
}

export function setAccountCompany(id: number, company: CompanyId) {
  db().prepare("UPDATE email_accounts SET default_company = ? WHERE id = ?").run(company, id);
}

export function setLastSync(id: number, iso: string) {
  db().prepare("UPDATE email_accounts SET last_sync_at = ? WHERE id = ?").run(iso, id);
}

export function deleteAccount(id: number) {
  db().prepare("DELETE FROM email_accounts WHERE id = ?").run(id);
}

export function isMessageSynced(provider: Provider, message_id: string): boolean {
  const row = db()
    .prepare("SELECT 1 FROM synced_messages WHERE provider = ? AND message_id = ?")
    .get(provider, message_id);
  return !!row;
}

export function recordSyncedMessage(input: {
  account_id: number;
  provider: Provider;
  message_id: string;
  subject: string | null;
  sender: string | null;
  received_at: string | null;
  task_id: number | null;
}) {
  db().prepare(`
    INSERT OR IGNORE INTO synced_messages (account_id, provider, message_id, subject, sender, received_at, task_id)
    VALUES (@account_id, @provider, @message_id, @subject, @sender, @received_at, @task_id)
  `).run(input);
}
