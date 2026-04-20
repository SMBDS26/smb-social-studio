import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return NextResponse.redirect(new URL(`/brands?error=twitter_denied`, req.url));
  if (!code || !state) return NextResponse.json({ error: "Invalid callback" }, { status: 400 });

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;
  const storedState = cookieStore.get("twitter_state")?.value;

  if (!codeVerifier || storedState !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const { brandId } = JSON.parse(Buffer.from(state, "base64").toString());

  // Exchange code for token
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/twitter/callback`,
      code_verifier: codeVerifier,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL(`/brands/${brandId}/connections?error=token`, req.url));
  }

  // Get user info
  const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();
  const twitterUser = userData.data;

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : null;

  await prisma.socialConnection.upsert({
    where: { brandId_platform_platformAccountId: { brandId, platform: "TWITTER", platformAccountId: twitterUser.id } },
    update: {
      platformName: `@${twitterUser.username}`,
      platformAvatarUrl: twitterUser.profile_image_url,
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
      tokenExpiresAt: expiresAt,
      isActive: true,
    },
    create: {
      brandId,
      platform: "TWITTER",
      platformAccountId: twitterUser.id,
      platformName: `@${twitterUser.username}`,
      platformAvatarUrl: twitterUser.profile_image_url,
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
      tokenExpiresAt: expiresAt,
    },
  });

  return NextResponse.redirect(new URL(`/brands/${brandId}/connections?success=twitter`, req.url));
}
