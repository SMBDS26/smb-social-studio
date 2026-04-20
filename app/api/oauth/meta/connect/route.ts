import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const brandId = url.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "Missing brandId" }, { status: 400 });

  const state = Buffer.from(JSON.stringify({ brandId })).toString("base64");

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", process.env.META_APP_ID!);
  authUrl.searchParams.set("redirect_uri", `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/meta/callback`);
  authUrl.searchParams.set("scope", "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
