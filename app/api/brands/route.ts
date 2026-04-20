import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  businessSummary: z.string().optional(),
  colorPrimary: z.string().optional(),
  colorSecondary: z.string().optional(),
  tone: z.enum(["PROFESSIONAL","FRIENDLY","BOLD","PLAYFUL","AUTHORITATIVE","CASUAL","INSPIRATIONAL"]).optional(),
  targetAudiences: z.array(z.any()).optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accountId = (session as { accountId?: string }).accountId;
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 400 });

  const brands = await prisma.brand.findMany({
    where: { accountId },
    include: { connections: true, _count: { select: { campaigns: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accountId = (session as { accountId?: string }).accountId;
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 400 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const brand = await prisma.brand.create({
      data: {
        ...data,
        accountId,
        targetAudiences: data.targetAudiences ?? [],
        logoUrl: data.logoUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
