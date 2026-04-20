import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ConnectionsClient } from "@/components/brand/ConnectionsClient";

export default async function ConnectionsPage({ params }: { params: Promise<{ brandId: string }> }) {
  const { brandId } = await params;
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, accountId },
    include: { connections: true },
  });

  if (!brand) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connect social accounts</h1>
        <p className="text-gray-500 mt-1">
          Connect <strong>{brand.name}</strong>&apos;s social media accounts to schedule and publish posts.
        </p>
      </div>
      <ConnectionsClient brand={brand} />
    </div>
  );
}
