# Activity Dashboard

A personal assistant dashboard that tracks day-to-day work across **AMET**, **Rihal**, and **PRID**, with automatic task creation from Gmail and Microsoft 365 mailboxes.

## What it does

- **Today view** — daily greeting, stats (open / done today / overdue / P1), per-company snapshots, focus list, in-progress, and recent inbox-sourced tasks.
- **Tasks** — list, search, filter by company, status, priority. Each row is editable inline (status, priority, company, due date) and via a full edit dialog.
- **Calendar** — agenda grouped by day for tasks with due dates.
- **Email Inbox** — every task that originated from an email, with a one-click "Sync emails" button.
- **Assistant** — daily briefing with highlights, warnings, and a suggested focus order computed from priority, due date, and status.
- **Settings** — connect Gmail / Microsoft accounts via OAuth and pick each mailbox's default company.

Tasks are automatically segregated by company. The router uses keywords in the sender, subject, and snippet — `amet` → AMET, `rihal` → Rihal, `prid` → PRID. If no hint matches, the email's account default company is used. Words like *urgent*, *asap*, *critical*, *P1* set priority to P1; *important*, *deadline*, *due*, *EOD* set P2. *Today* / *EOD* / *tomorrow* infer due dates.

## Tech

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- SQLite via `better-sqlite3` (file-based, no external DB)
- `googleapis` for Gmail
- `@azure/msal-node` + `@microsoft/microsoft-graph-client` for Microsoft 365 / Outlook

## Run locally

```bash
npm install
cp .env.example .env.local
# (fill in OAuth credentials — see below)
npm run dev
```

Open http://localhost:3000 — the app works immediately with manual task creation. To get email-to-task auto-creation, configure the OAuth providers below.

To populate a few example tasks across AMET / Rihal / PRID so you can see the company tabs and assistant briefing in action:

```bash
npm run seed
```

## Connecting Gmail

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project.
2. **APIs & Services → Library** → enable **Gmail API**.
3. **OAuth consent screen** → set up an external app (you can keep it in *Testing* mode and add yourself as a test user).
4. **Credentials** → **Create credentials → OAuth client ID → Web application**.
   - Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Copy the client ID / secret into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```
6. Restart the dev server, then go to **Settings → Connect Gmail**.

## Connecting Microsoft 365 / Outlook

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory → App registrations → New registration**.
2. Set redirect URI (Web) to `http://localhost:3000/api/auth/microsoft/callback`.
3. Under **API permissions**, add delegated permissions: `User.Read`, `Mail.Read`, `offline_access`, `openid`, `profile`.
4. Under **Certificates & secrets**, create a new client secret.
5. Fill in `.env.local`:
   ```
   MS_CLIENT_ID=...
   MS_CLIENT_SECRET=...
   MS_TENANT_ID=common         # or your tenant id
   MS_REDIRECT_URI=http://localhost:3000/api/auth/microsoft/callback
   ```
6. Restart the dev server, then go to **Settings → Connect Outlook / Microsoft 365**.

## How auto-create works

When you click **Sync emails** (Inbox page), the app pulls the 25 most recent inbox messages from every connected account, skips any it has already seen, and creates one task per new message. The task carries:
- a back-link to the original message in Gmail / Outlook,
- the sender and subject,
- a routed company, priority, and (when the body hints at it) a due date.

Re-running sync is safe — a unique constraint on `(provider, message_id)` keeps it idempotent.

You can also POST `/api/sync` from any scheduler (cron, GitHub Actions, etc.) to keep tasks flowing without opening the UI.

## Project layout

```
src/
  app/
    page.tsx                  Today
    tasks/page.tsx            Tasks
    calendar/page.tsx         Calendar
    inbox/page.tsx            Email-sourced tasks
    assistant/page.tsx        Daily briefing
    settings/                 Connect / manage accounts
    actions.ts                Server actions for create/update/delete
    api/
      auth/google/...         Gmail OAuth start + callback
      auth/microsoft/...      MS OAuth start + callback
      sync/route.ts           Manual sync endpoint
  components/                 UI building blocks (cards, chips, rows, dialogs)
  lib/
    db.ts                     SQLite migrations + connection
    types.ts                  Shared types and constants
    tasks.ts                  Task CRUD + stats
    accounts.ts               Email account & synced message storage
    gmail.ts                  Gmail OAuth + message fetch
    microsoft.ts              MSAL OAuth + Graph fetch
    sync.ts                   Email → task pipeline
    routing.ts                Subject/sender → company / priority / due
    assistant.ts              Briefing generation
data/
  dashboard.sqlite            (created on first run, gitignored)
```

## Notes

- This is a single-user local-first dashboard — there's no auth on the dashboard itself, so don't expose port 3000 publicly without adding one.
- Tokens are stored in SQLite. For production you'd want them encrypted at rest and refreshed automatically; the current setup is suitable for a personal dev machine.
