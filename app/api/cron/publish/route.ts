import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishPost } from "@/lib/social";
import { decrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  // Protect with secret header
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const duePosts = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    include: { socialConnection: true },
    take: 50, // process in batches
  });

  const results = await Promise.allSettled(
    duePosts.map(async (post: typeof duePosts[0]) => {
      if (!post.socialConnection) {
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "FAILED", publishError: "No social connection" },
        });
        return;
      }

      await prisma.post.update({ where: { id: post.id }, data: { status: "PUBLISHING" } });

      try {
        const platformPostId = await publishPost(post, post.socialConnection);
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "PUBLISHED", publishedAt: new Date(), platformPostId },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await prisma.post.update({
          where: { id: post.id },
          data: { status: "FAILED", publishError: message },
        });
      }
    })
  );

  const published = results.filter((r: PromiseSettledResult<void>) => r.status === "fulfilled").length;
  const failed = results.filter((r: PromiseSettledResult<void>) => r.status === "rejected").length;

  return NextResponse.json({ processed: duePosts.length, published, failed });
}
