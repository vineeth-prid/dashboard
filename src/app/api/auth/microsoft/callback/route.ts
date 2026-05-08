import { NextRequest, NextResponse } from "next/server";
import { msExchangeCode } from "@/lib/microsoft";
import { upsertAccount } from "@/lib/accounts";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=missing_code", req.url));
  }
  try {
    const result = await msExchangeCode(code);
    const account = result.account;
    upsertAccount({
      provider: "microsoft",
      email: account?.username || "unknown@microsoft",
      display_name: account?.name ?? null,
      access_token: result.accessToken,
      refresh_token: null,
      token_expires_at: result.expiresOn?.toISOString() ?? null,
    });
    return NextResponse.redirect(new URL("/settings?connected=microsoft", req.url));
  } catch (err) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent((err as Error).message)}`, req.url),
    );
  }
}
