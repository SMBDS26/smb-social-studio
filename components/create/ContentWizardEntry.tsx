"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/stores/wizardStore";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import type { BrandWithConnections } from "@/types";
import type { Platform } from "@prisma/client";

interface Props {
  brands: BrandWithConnections[];
}

const WIZARD_STEPS = [
  { id: 1, title: "Upload media" },
  { id: 2, title: "Campaign brief" },
  { id: 3, title: "Events & promos" },
  { id: 4, title: "Platforms" },
  { id: 5, title: "Hashtags & CTAs" },
];

export function ContentWizardEntry({ brands }: Props) {
  const router = useRouter();
  const { activeBrandId, setActiveBrandId } = useAppStore();
  const { setCampaignId, setBrandId, reset, updateBrief } = useWizardStore();
  const [selectedBrandId, setSelectedBrandId] = useState(activeBrandId ?? brands[0]?.id ?? "");
  const [creating, setCreating] = useState(false);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  const start = async () => {
    if (!selectedBrandId) return;
    setCreating(true);
    try {
      reset();
      setBrandId(selectedBrandId);
      setActiveBrandId(selectedBrandId);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: selectedBrandId }),
      });

      if (!res.ok) throw new Error("Failed to create campaign");
      const campaign = await res.json();
      setCampaignId(campaign.id);
      router.push(`/create/${campaign.id}/brief`);
    } catch {
      toast.error("Failed to start. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand selection */}
      {brands.length > 1 && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <Label className="text-base font-semibold">Select a brand</Label>
            <div className="grid gap-2">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setSelectedBrandId(brand.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    selectedBrandId === brand.id
                      ? "border-violet-600 bg-violet-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{brand.name}</p>
                    <p className="text-xs text-gray-500">{brand.industry}</p>
                  </div>
                  {brand.connections.length > 0 && (
                    <div className="ml-auto flex gap-1">
                      {brand.connections.map((c) => (
                        <div
                          key={c.id}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[c.platform as Platform] }}
                          title={PLATFORM_LABELS[c.platform as Platform]}
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* What we'll do */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">How it works</h3>
            <p className="text-sm text-gray-500 mt-1">5 quick steps to a full month of content</p>
          </div>
          <div className="space-y-3">
            {WIZARD_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step.id}
                </div>
                <p className="text-sm text-gray-700">{step.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBrand && selectedBrand.connections.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>Tip:</strong> You haven&apos;t connected any social accounts to this brand yet. You can still generate content and connect them before scheduling.
        </div>
      )}

      <Button
        onClick={start}
        disabled={!selectedBrandId || creating}
        className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-base"
      >
        {creating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
        {creating ? "Setting up..." : "Start creating content"}
        {!creating && <ArrowRight className="w-5 h-5 ml-2" />}
      </Button>
    </div>
  );
}
