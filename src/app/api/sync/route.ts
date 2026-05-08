import { NextResponse } from "next/server";
import { syncAllAccounts } from "@/lib/sync";

export async function POST() {
  const results = await syncAllAccounts();
  return NextResponse.json({ ok: true, results });
}

export async function GET() {
  const results = await syncAllAccounts();
  return NextResponse.json({ ok: true, results });
}
