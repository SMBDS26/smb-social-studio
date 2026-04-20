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

  if (error) return NextResponse.redirect(new URL(`/brands?error=linkedin_denied`, req.url));
  if (!code || !state) return NextResponse.json({ error: "Invalid callback" }, { status: 400 });

  const { brandId } = JSON.parse(Buffer.from(state, "base64").toString());

  // Exchange code for token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/linkedin/callback`,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.redirect(new URL(`/brands/${brandId}/connections?error=token`, req.url));
  }

  // Get organization info
  const orgRes = await fetch(
    "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&projection=(elements*(*,organizationalTarget~(localizedName,logoV2(original~:playableStreams))))",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const orgData = await orgRes.json();
  const org = orgData.elements?.[0];
  const orgId = org?.organizationalTarget?.split(":").pop() ?? "unknown";
  const orgName = org?.["organizationalTarget~"]?.localizedName ?? "LinkedIn Page";

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : null;

  await prisma.socialConnection.upsert({
    where: { brandId_platform_platformAccountId: { brandId, platform: "LINKEDIN", platformAccountId: orgId } },
    update: {
      platformName: orgName,
      accessToken: encrypt(tokenData.access_token),
      tokenExpiresAt: expiresAt,
      isActive: true,
    },
    create: {
      brandId,
      platform: "LINKEDIN",
      platformAccountId: orgId,
      platformName: orgName,
      accessToken: encrypt(tokenData.access_token),
      tokenExpiresAt: expiresAt,
    },
  });

  return NextResponse.redirect(new URL(`/brands/${brandId}/connections?success=linkedin`, req.url));
}
