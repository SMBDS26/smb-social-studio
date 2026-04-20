"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/appStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Building2, Plus } from "lucide-react";
import Link from "next/link";
import type { BrandWithConnections } from "@/types";

export function BrandSwitcher() {
  const { activeBrandId, setActiveBrandId } = useAppStore();

  const { data: brands = [] } = useQuery<BrandWithConnections[]>({
    queryKey: ["brands"],
    queryFn: () => fetch("/api/brands").then((r) => r.json()),
  });

  const activeBrand = brands.find((b) => b.id === activeBrandId) ?? brands[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 max-w-[200px]">
          <Building2 className="w-4 h-4 flex-shrink-0 text-violet-600" />
          <span className="truncate text-sm">
            {activeBrand?.name ?? "Select brand"}
          </span>
          <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {brands.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">No brands yet</div>
        ) : (
          brands.map((brand) => (
            <DropdownMenuItem
              key={brand.id}
              onClick={() => setActiveBrandId(brand.id)}
              className={activeBrand?.id === brand.id ? "bg-violet-50 text-violet-700" : ""}
            >
              <Building2 className="w-4 h-4 mr-2 opacity-50" />
              {brand.name}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/brands/new">
            <Plus className="w-4 h-4 mr-2" />
            Add new brand
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
