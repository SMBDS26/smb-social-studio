import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BrandSettingsClient } from "@/components/brand/BrandSettingsClient";

export default async function BrandSettingsPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, accountId },
  });

  if (!brand) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Brand settings</h1>
      <BrandSettingsClient brand={brand} />
    </div>
  );
}
