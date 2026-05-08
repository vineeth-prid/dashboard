import { google, gmail_v1 } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid",
];

export function gmailOAuthClient(): OAuth2Client {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect = process.env.GOOGLE_REDIRECT_URI;
  if (!id || !secret || !redirect) {
    throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI");
  }
  return new google.auth.OAuth2(id, secret, redirect);
}

export function gmailAuthUrl(state: string): string {
  return gmailOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state,
  });
}

export async function gmailExchangeCode(code: string) {
  const client = gmailOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const me = await oauth2.userinfo.get();
  return {
    tokens,
    email: me.data.email!,
    name: me.data.name ?? null,
  };
}

export function gmailClientFromTokens(access_token: string, refresh_token?: string | null) {
  const client = gmailOAuthClient();
  client.setCredentials({ access_token, refresh_token: refresh_token ?? undefined });
  return google.gmail({ version: "v1", auth: client });
}

export interface GmailMessageSummary {
  id: string;
  subject: string | null;
  sender: string | null;
  snippet: string | null;
  received_at: string | null;
  link: string;
}

export async function fetchRecentGmail(
  client: gmail_v1.Gmail,
  max = 25,
): Promise<GmailMessageSummary[]> {
  const list = await client.users.messages.list({
    userId: "me",
    maxResults: max,
    q: "in:inbox -category:promotions -category:social",
  });

  const out: GmailMessageSummary[] = [];
  for (const m of list.data.messages ?? []) {
    if (!m.id) continue;
    const detail = await client.users.messages.get({
      userId: "me",
      id: m.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });
    const headers = detail.data.payload?.headers ?? [];
    const h = (name: string) => headers.find((x) => x.name?.toLowerCase() === name.toLowerCase())?.value ?? null;
    out.push({
      id: m.id,
      subject: h("Subject"),
      sender: h("From"),
      snippet: detail.data.snippet ?? null,
      received_at: h("Date") ? new Date(h("Date")!).toISOString() : null,
      link: `https://mail.google.com/mail/u/0/#inbox/${m.id}`,
    });
  }
  return out;
}
