import { NextRequest, NextResponse } from "next/server";
import { gmailExchangeCode } from "@/lib/gmail";
import { upsertAccount } from "@/lib/accounts";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=missing_code", req.url));
  }
  try {
    const { tokens, email, name } = await gmailExchangeCode(code);
    upsertAccount({
      provider: "gmail",
      email,
      display_name: name,
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? null,
      token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    });
    return NextResponse.redirect(new URL("/settings?connected=gmail", req.url));
  } catch (err) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent((err as Error).message)}`, req.url),
    );
  }
}
