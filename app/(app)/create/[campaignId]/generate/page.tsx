import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GeneratePage } from "@/components/generate/GeneratePage";

export default async function GeneratePageRoute({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brand: { accountId } },
    include: { brand: true },
  });

  if (!campaign) notFound();

  return <GeneratePage campaign={campaign} brand={campaign.brand} />;
}
