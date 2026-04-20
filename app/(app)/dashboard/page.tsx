import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const [brandCount, campaignCount, scheduledCount] = await Promise.all([
    prisma.brand.count({ where: { accountId } }),
    prisma.campaign.count({ where: { brand: { accountId } } }),
    prisma.post.count({ where: { campaign: { brand: { accountId } }, status: "SCHEDULED" } }),
  ]);

  const recentPosts = await prisma.post.findMany({
    where: { campaign: { brand: { accountId } }, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: { campaign: { include: { brand: true } } },
  });

  const upcomingPosts = await prisma.post.findMany({
    where: { campaign: { brand: { accountId } }, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 5,
    include: { campaign: { include: { brand: true } } },
  });

  return (
    <DashboardClient
      stats={{ brandCount, campaignCount, scheduledCount }}
      recentPosts={recentPosts}
      upcomingPosts={upcomingPosts}
      userName={session?.user?.name?.split(" ")[0] ?? "there"}
    />
  );
}
