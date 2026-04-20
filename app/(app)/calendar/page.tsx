import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarClient } from "@/components/calendar/CalendarClient";

export default async function CalendarPage() {
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const posts = await prisma.post.findMany({
    where: {
      campaign: { brand: { accountId } },
      OR: [{ status: "SCHEDULED" }, { status: "PUBLISHED" }, { status: "FAILED" }],
    },
    include: { campaign: { include: { brand: true } } },
    orderBy: { scheduledAt: "asc" },
  });

  return <CalendarClient posts={posts} />;
}
