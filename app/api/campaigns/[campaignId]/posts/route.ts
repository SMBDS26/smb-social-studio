import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { campaignId } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brand: { accountId } },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const posts = await prisma.post.findMany({
    where: { campaignId },
    orderBy: [{ platform: "asc" }, { scheduledAt: "asc" }],
  });

  return NextResponse.json(posts);
}
