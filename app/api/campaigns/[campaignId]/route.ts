import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCampaign(campaignId: string, accountId: string) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, brand: { accountId } },
    include: { posts: { orderBy: { scheduledAt: "asc" } }, brand: true },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { campaignId } = await params;

  const campaign = await getCampaign(campaignId, accountId);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(campaign);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { campaignId } = await params;

  const existing = await getCampaign(campaignId, accountId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: body,
  });

  return NextResponse.json(campaign);
}
