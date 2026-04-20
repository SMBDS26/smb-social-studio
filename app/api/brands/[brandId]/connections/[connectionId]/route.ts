import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ brandId: string; connectionId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { brandId, connectionId } = await params;

  const brand = await prisma.brand.findFirst({ where: { id: brandId, accountId } });
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.socialConnection.delete({ where: { id: connectionId, brandId } });
  return NextResponse.json({ success: true });
}
