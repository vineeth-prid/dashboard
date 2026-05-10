import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

export const MS_SCOPES = ["openid", "profile", "offline_access", "User.Read", "Mail.Read"];

export function msalClient(): ConfidentialClientApplication {
  const id = process.env.MS_CLIENT_ID?.trim();
  const secret = process.env.MS_CLIENT_SECRET?.trim();
  const tenant = process.env.MS_TENANT_ID?.trim() || "common";
  if (!id || !secret) {
    throw new Error("Missing MS_CLIENT_ID / MS_CLIENT_SECRET");
  }
  return new ConfidentialClientApplication({
    auth: {
      clientId: id,
      clientSecret: secret,
      authority: `https://login.microsoftonline.com/${tenant}`,
    },
  });
}

export function msAuthRedirect(): string {
  const redirect = process.env.MS_REDIRECT_URI?.trim();
  if (!redirect) throw new Error("Missing MS_REDIRECT_URI");
  return redirect;
}

export async function msAuthUrl(state: string): Promise<string> {
  return msalClient().getAuthCodeUrl({
    scopes: MS_SCOPES,
    redirectUri: msAuthRedirect(),
    state,
  });
}

export async function msExchangeCode(code: string) {
  const result = await msalClient().acquireTokenByCode({
    code,
    scopes: MS_SCOPES,
    redirectUri: msAuthRedirect(),
  });
  if (!result) throw new Error("Microsoft token exchange returned no result");
  return result;
}

export function graphClientFromToken(access_token: string): Client {
  return Client.init({
    authProvider: (done) => done(null, access_token),
  });
}

export interface MsMessageSummary {
  id: string;
  subject: string | null;
  sender: string | null;
  snippet: string | null;
  received_at: string | null;
  link: string;
}

export async function fetchRecentOutlook(client: Client, top = 25): Promise<MsMessageSummary[]> {
  const res = await client
    .api("/me/messages")
    .top(top)
    .select("id,subject,from,bodyPreview,receivedDateTime,webLink")
    .orderby("receivedDateTime DESC")
    .get();

  const items = (res.value ?? []) as Array<{
    id: string;
    subject: string | null;
    from?: { emailAddress?: { name?: string; address?: string } };
    bodyPreview?: string;
    receivedDateTime?: string;
    webLink?: string;
  }>;

  return items.map((m) => {
    const fromName = m.from?.emailAddress?.name;
    const fromAddr = m.from?.emailAddress?.address;
    return {
      id: m.id,
      subject: m.subject ?? null,
      sender: fromName && fromAddr ? `${fromName} <${fromAddr}>` : (fromAddr ?? fromName ?? null),
      snippet: m.bodyPreview ?? null,
      received_at: m.receivedDateTime ?? null,
      link: m.webLink ?? `https://outlook.office.com/mail/inbox/id/${m.id}`,
    };
  });
}
