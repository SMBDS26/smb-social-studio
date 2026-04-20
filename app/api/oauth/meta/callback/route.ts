import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { getMetaPages } from "@/lib/social/meta";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/brands?error=meta_denied`, req.url));
  }

  if (!code || !state) return NextResponse.json({ error: "Invalid callback" }, { status: 400 });

  const { brandId } = JSON.parse(Buffer.from(state, "base64").toString());

  // Exchange code for token
  const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
  tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  tokenUrl.searchParams.set("redirect_uri", `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/meta/callback`);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL(`/brands/${brandId}/connections?error=token`, req.url));
  }

  // Exchange for long-lived token
  const llUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  llUrl.searchParams.set("grant_type", "fb_exchange_token");
  llUrl.searchParams.set("client_id", process.env.META_APP_ID!);
  llUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  llUrl.searchParams.set("fb_exchange_token", tokenData.access_token);
  const llRes = await fetch(llUrl.toString());
  const llData = await llRes.json();
  const longLivedToken = llData.access_token ?? tokenData.access_token;

  // Get pages
  const pages = await getMetaPages(longLivedToken);

  // Store first Facebook page + Instagram account
  for (const page of pages.data ?? []) {
    // Get page-level token
    const pageTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=access_token&access_token=${longLivedToken}`
    );
    const pageTokenData = await pageTokenRes.json();
    const pageToken = pageTokenData.access_token ?? longLivedToken;

    await prisma.socialConnection.upsert({
      where: {
        brandId_platform_platformAccountId: {
          brandId,
          platform: "FACEBOOK",
          platformAccountId: page.id,
        },
      },
      update: {
        platformName: page.name,
        accessToken: encrypt(pageToken),
        isActive: true,
      },
      create: {
        brandId,
        platform: "FACEBOOK",
        platformAccountId: page.id,
        platformName: page.name,
        accessToken: encrypt(pageToken),
      },
    });

    // If there's an Instagram business account connected
    if (page.instagram_business_account?.id) {
      await prisma.socialConnection.upsert({
        where: {
          brandId_platform_platformAccountId: {
            brandId,
            platform: "INSTAGRAM",
            platformAccountId: page.instagram_business_account.id,
          },
        },
        update: {
          platformName: `${page.name} (Instagram)`,
          accessToken: encrypt(pageToken),
          isActive: true,
        },
        create: {
          brandId,
          platform: "INSTAGRAM",
          platformAccountId: page.instagram_business_account.id,
          platformName: `${page.name} (Instagram)`,
          accessToken: encrypt(pageToken),
        },
      });
    }
  }

  return NextResponse.redirect(new URL(`/brands/${brandId}/connections?success=meta`, req.url));
}
