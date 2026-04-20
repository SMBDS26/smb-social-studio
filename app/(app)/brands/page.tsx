import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building2, Settings, Link2 } from "lucide-react";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import type { Platform } from "@prisma/client";

export default async function BrandsPage() {
  const session = await auth();
  const accountId = (session as { accountId?: string }).accountId!;

  const brands = await prisma.brand.findMany({
    where: { accountId },
    include: {
      connections: true,
      _count: { select: { campaigns: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/brands/new">
            <PlusCircle className="w-4 h-4 mr-2" /> Add brand
          </Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No brands yet</h3>
          <p className="text-gray-500 text-sm mb-4">Add your first brand to start creating content</p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/brands/new">Add your first brand</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: brand.colorPrimary ?? "#7C3AED" }}
                      >
                        {brand.name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                      <p className="text-xs text-gray-500">{brand.industry}</p>
                    </div>
                  </div>
                </div>

                {/* Connected platforms */}
                <div className="flex items-center gap-1.5 mb-3">
                  {brand.connections.length > 0 ? (
                    brand.connections.map((c) => (
                      <div
                        key={c.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${PLATFORM_COLORS[c.platform as Platform]}20` }}
                        title={PLATFORM_LABELS[c.platform as Platform]}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[c.platform as Platform] }}
                        />
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No platforms connected</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>{brand._count.campaigns} campaign{brand._count.campaigns !== 1 ? "s" : ""}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1 text-xs">
                    <Link href={`/brands/${brand.id}/connections`}>
                      <Link2 className="w-3 h-3 mr-1" /> Connect
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="flex-1 text-xs">
                    <Link href={`/brands/${brand.id}/settings`}>
                      <Settings className="w-3 h-3 mr-1" /> Settings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
