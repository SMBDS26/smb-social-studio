import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  brandId: z.string(),
  name: z.string().default("Monthly Social Media Calendar"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;

  const body = await req.json();
  const data = createSchema.parse(body);

  // Verify brand belongs to account
  const brand = await prisma.brand.findFirst({ where: { id: data.brandId, accountId } });
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const campaign = await prisma.campaign.create({
    data: {
      brandId: data.brandId,
      name: data.name,
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
