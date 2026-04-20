import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return NextResponse.redirect(new URL(`/brands?error=tiktok_denied`, req.url));
  if (!code || !state) return NextResponse.json({ error: "Invalid callback" }, { status: 400 });

  const { brandId } = JSON.parse(Buffer.from(state, "base64").toString());

  // Exchange code for token
  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/tiktok/callback`,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.data?.access_token) {
    return NextResponse.redirect(new URL(`/brands/${brandId}/connections?error=token`, req.url));
  }

  const { access_token, refresh_token, open_id, expires_in } = tokenData.data;

  // Get user info
  const userRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const userData = await userRes.json();
  const tiktokUser = userData.data?.user;

  const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

  await prisma.socialConnection.upsert({
    where: { brandId_platform_platformAccountId: { brandId, platform: "TIKTOK", platformAccountId: open_id } },
    update: {
      platformName: tiktokUser?.display_name ?? "TikTok Account",
      platformAvatarUrl: tiktokUser?.avatar_url,
      accessToken: encrypt(access_token),
      refreshToken: refresh_token ? encrypt(refresh_token) : null,
      tokenExpiresAt: expiresAt,
      isActive: true,
    },
    create: {
      brandId,
      platform: "TIKTOK",
      platformAccountId: open_id,
      platformName: tiktokUser?.display_name ?? "TikTok Account",
      platformAvatarUrl: tiktokUser?.avatar_url,
      accessToken: encrypt(access_token),
      refreshToken: refresh_token ? encrypt(refresh_token) : null,
      tokenExpiresAt: expiresAt,
    },
  });

  return NextResponse.redirect(new URL(`/brands/${brandId}/connections?success=tiktok`, req.url));
}
