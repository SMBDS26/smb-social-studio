import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  scheduledAt: z.string().datetime(),
});

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { postId } = await params;

  const post = await prisma.post.findFirst({
    where: { id: postId, campaign: { brand: { accountId } } },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data = schema.parse(body);

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      scheduledAt: new Date(data.scheduledAt),
      status: "SCHEDULED",
    },
  });

  return NextResponse.json(updated);
}
