import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function getBrand(brandId: string, accountId: string) {
  return prisma.brand.findFirst({
    where: { id: brandId, accountId },
    include: { connections: true },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { brandId } = await params;

  const brand = await getBrand(brandId, accountId);
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(brand);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { brandId } = await params;

  const existing = await getBrand(brandId, accountId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const brand = await prisma.brand.update({
    where: { id: brandId },
    data: body,
  });

  return NextResponse.json(brand);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { brandId } = await params;

  const existing = await getBrand(brandId, accountId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.brand.delete({ where: { id: brandId } });
  return NextResponse.json({ success: true });
}
