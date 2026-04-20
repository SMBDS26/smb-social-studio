import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishPost } from "@/lib/social";

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { postId } = await params;

  const post = await prisma.post.findFirst({
    where: { id: postId, campaign: { brand: { accountId } } },
    include: { socialConnection: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!post.socialConnection) {
    return NextResponse.json({ error: "No social connection linked to this post" }, { status: 400 });
  }

  await prisma.post.update({ where: { id: postId }, data: { status: "PUBLISHING" } });

  try {
    const platformPostId = await publishPost(post, post.socialConnection);
    await prisma.post.update({
      where: { id: postId },
      data: { status: "PUBLISHED", publishedAt: new Date(), platformPostId },
    });
    return NextResponse.json({ success: true, platformPostId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    await prisma.post.update({
      where: { id: postId },
      data: { status: "FAILED", publishError: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
