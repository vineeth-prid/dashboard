import Link from "next/link";

export function ConnectButtons({
  googleConfigured,
  msConfigured,
}: {
  googleConfigured: boolean;
  msConfigured: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {googleConfigured ? (
        <Link className="btn-primary" href="/api/auth/google">Connect Gmail</Link>
      ) : (
        <button className="btn-ghost cursor-not-allowed opacity-60" disabled title="Set GOOGLE_CLIENT_ID etc.">
          Gmail not configured
        </button>
      )}
      {msConfigured ? (
        <Link className="btn-primary" href="/api/auth/microsoft">Connect Outlook / Microsoft 365</Link>
      ) : (
        <button className="btn-ghost cursor-not-allowed opacity-60" disabled title="Set MS_CLIENT_ID etc.">
          Microsoft not configured
        </button>
      )}
    </div>
  );
}
