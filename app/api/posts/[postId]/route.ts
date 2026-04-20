import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getPost(postId: string, accountId: string) {
  return prisma.post.findFirst({
    where: { id: postId, campaign: { brand: { accountId } } },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { postId } = await params;

  const existing = await getPost(postId, accountId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const post = await prisma.post.update({
    where: { id: postId },
    data: body,
  });

  return NextResponse.json(post);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { postId } = await params;

  const existing = await getPost(postId, accountId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
