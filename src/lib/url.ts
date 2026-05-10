import type { NextRequest } from "next/server";

export function appBaseUrl(req?: NextRequest): string {
  const fromEnv = process.env.APP_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (req) {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host) return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export function publicUrl(pathOrUrl: string, req?: NextRequest): URL {
  return new URL(pathOrUrl, appBaseUrl(req));
}
