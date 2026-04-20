import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SchedulePageClient } from "@/components/schedule/SchedulePageClient";

export default async function SchedulePage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brand: { accountId } },
    include: {
      brand: { include: { connections: true } },
      posts: { orderBy: [{ platform: "asc" }, { scheduledAt: "asc" }] },
    },
  });

  if (!campaign) notFound();

  return <SchedulePageClient campaign={campaign} />;
}
