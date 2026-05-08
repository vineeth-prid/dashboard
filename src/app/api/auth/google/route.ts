import { NextResponse } from "next/server";
import { gmailAuthUrl } from "@/lib/gmail";

export async function GET() {
  try {
    const url = gmailAuthUrl("dashboard");
    return NextResponse.redirect(url);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Google OAuth is not configured.",
        hint: "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env.local",
        message: (err as Error).message,
      },
      { status: 500 },
    );
  }
}
