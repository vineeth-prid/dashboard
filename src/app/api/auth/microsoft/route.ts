import { NextResponse } from "next/server";
import { msAuthUrl } from "@/lib/microsoft";

export async function GET() {
  try {
    const url = await msAuthUrl("dashboard");
    return NextResponse.redirect(url);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Microsoft OAuth is not configured.",
        hint: "Set MS_CLIENT_ID, MS_CLIENT_SECRET, MS_TENANT_ID, MS_REDIRECT_URI in .env.local",
        message: (err as Error).message,
      },
      { status: 500 },
    );
  }
}
