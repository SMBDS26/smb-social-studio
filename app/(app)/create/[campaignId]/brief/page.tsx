import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BriefWizard } from "@/components/create/BriefWizard";

export default async function BriefPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brand: { accountId } },
    include: { brand: { include: { connections: true } } },
  });

  if (!campaign) notFound();

  return <BriefWizard campaign={campaign} brand={campaign.brand} />;
}
