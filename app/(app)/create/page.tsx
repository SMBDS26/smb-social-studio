import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ContentWizardEntry } from "@/components/create/ContentWizardEntry";

export default async function CreatePage() {
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const brands = await prisma.brand.findMany({
    where: { accountId },
    include: { connections: true },
    orderBy: { createdAt: "asc" },
  });

  if (brands.length === 0) redirect("/brands/new");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create social media content</h1>
        <p className="text-gray-500 mt-1">
          AI will generate a full month of platform-perfect posts for your brand.
        </p>
      </div>
      <ContentWizardEntry brands={brands} />
    </div>
  );
}
