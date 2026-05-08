import { listAccounts, isMessageSynced, recordSyncedMessage, setLastSync } from "./accounts";
import { createTask } from "./tasks";
import { fetchRecentGmail, gmailClientFromTokens } from "./gmail";
import { fetchRecentOutlook, graphClientFromToken } from "./microsoft";
import { deriveTaskTitle, routeEmail } from "./routing";
import type { EmailAccount } from "./types";

export interface SyncResult {
  account: string;
  provider: string;
  fetched: number;
  created: number;
  error?: string;
}

export async function syncAllAccounts(): Promise<SyncResult[]> {
  const accounts = listAccounts();
  const results: SyncResult[] = [];
  for (const account of accounts) {
    try {
      const r = await syncAccount(account);
      results.push(r);
    } catch (err) {
      results.push({
        account: account.email,
        provider: account.provider,
        fetched: 0,
        created: 0,
        error: (err as Error).message,
      });
    }
  }
  return results;
}

export async function syncAccount(account: EmailAccount): Promise<SyncResult> {
  if (account.provider === "gmail") return syncGmailAccount(account);
  if (account.provider === "microsoft") return syncMicrosoftAccount(account);
  throw new Error(`Unknown provider: ${account.provider}`);
}

async function syncGmailAccount(account: EmailAccount): Promise<SyncResult> {
  const client = gmailClientFromTokens(account.access_token, account.refresh_token);
  const messages = await fetchRecentGmail(client, 25);
  let created = 0;
  for (const m of messages) {
    if (isMessageSynced("gmail", m.id)) continue;
    const route = routeEmail({
      sender: m.sender,
      subject: m.subject,
      snippet: m.snippet,
      defaultCompany: account.default_company,
    });
    const task = createTask({
      title: deriveTaskTitle(m.subject, m.sender),
      notes: m.snippet,
      company: route.company,
      priority: route.priority,
      due_at: route.due_at,
      source: "email",
      source_provider: "gmail",
      source_message_id: m.id,
      source_subject: m.subject,
      source_sender: m.sender,
      source_link: m.link,
    });
    recordSyncedMessage({
      account_id: account.id,
      provider: "gmail",
      message_id: m.id,
      subject: m.subject,
      sender: m.sender,
      received_at: m.received_at,
      task_id: task.id,
    });
    created++;
  }
  setLastSync(account.id, new Date().toISOString());
  return { account: account.email, provider: "gmail", fetched: messages.length, created };
}

async function syncMicrosoftAccount(account: EmailAccount): Promise<SyncResult> {
  const client = graphClientFromToken(account.access_token);
  const messages = await fetchRecentOutlook(client, 25);
  let created = 0;
  for (const m of messages) {
    if (isMessageSynced("microsoft", m.id)) continue;
    const route = routeEmail({
      sender: m.sender,
      subject: m.subject,
      snippet: m.snippet,
      defaultCompany: account.default_company,
    });
    const task = createTask({
      title: deriveTaskTitle(m.subject, m.sender),
      notes: m.snippet,
      company: route.company,
      priority: route.priority,
      due_at: route.due_at,
      source: "email",
      source_provider: "microsoft",
      source_message_id: m.id,
      source_subject: m.subject,
      source_sender: m.sender,
      source_link: m.link,
    });
    recordSyncedMessage({
      account_id: account.id,
      provider: "microsoft",
      message_id: m.id,
      subject: m.subject,
      sender: m.sender,
      received_at: m.received_at,
      task_id: task.id,
    });
    created++;
  }
  setLastSync(account.id, new Date().toISOString());
  return { account: account.email, provider: "microsoft", fetched: messages.length, created };
}
