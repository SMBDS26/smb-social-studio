"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Brand, BrandTone } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Trash2 } from "lucide-react";
import { BrandColorPicker } from "./BrandColorPicker";
import { BrandToneSelector } from "./BrandToneSelector";
import { AudienceBuilder } from "./AudienceBuilder";
import { INDUSTRIES } from "@/types";

interface Props { brand: Brand }

export function BrandSettingsClient({ brand }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [colorPrimary, setColorPrimary] = useState(brand.colorPrimary ?? "#7C3AED");
  const [colorSecondary, setColorSecondary] = useState(brand.colorSecondary ?? "#A78BFA");
  const [tone, setTone] = useState<BrandTone>(brand.tone);
  const [audiences, setAudiences] = useState<{ id: string; label: string; notes: string }[]>(
    (brand.targetAudiences as { id: string; label: string; notes: string }[]) ?? []
  );

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: brand.name,
      industry: brand.industry ?? "",
      websiteUrl: brand.websiteUrl ?? "",
      businessSummary: brand.businessSummary ?? "",
      instagramUrl: brand.instagramUrl ?? "",
      facebookUrl: brand.facebookUrl ?? "",
      linkedinUrl: brand.linkedinUrl ?? "",
      twitterUrl: brand.twitterUrl ?? "",
      tiktokUrl: brand.tiktokUrl ?? "",
    },
  });

  const onSubmit = async (data: Record<string, string>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, colorPrimary, colorSecondary, tone, targetAudiences: audiences }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Brand settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async () => {
    if (!confirm(`Are you sure you want to delete "${brand.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/brands/${brand.id}`, { method: "DELETE" });
      toast.success("Brand deleted");
      router.push("/brands");
    } catch {
      toast.error("Failed to delete brand");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Brand identity</h2>
          <div className="space-y-2">
            <Label>Business name</Label>
            <Input {...register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register("industry")}>
              <option value="">Select industry...</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input {...register("websiteUrl")} placeholder="https://yoursite.com" />
          </div>
          <div className="space-y-2">
            <Label>Business summary</Label>
            <Textarea rows={4} {...register("businessSummary")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Brand style</h2>
          <div className="flex gap-4">
            <BrandColorPicker label="Primary colour" value={colorPrimary} onChange={setColorPrimary} />
            <BrandColorPicker label="Secondary colour" value={colorSecondary} onChange={setColorSecondary} />
          </div>
          <div>
            <Label className="mb-3 block">Tone of voice</Label>
            <BrandToneSelector value={tone} onChange={setTone} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Target audiences</h2>
          <AudienceBuilder value={audiences} onChange={setAudiences} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Social profile links</h2>
          {(["instagramUrl", "facebookUrl", "linkedinUrl", "twitterUrl", "tiktokUrl"] as const).map((field) => (
            <div key={field} className="space-y-1">
              <Label className="text-sm capitalize">{field.replace("Url", "")}</Label>
              <Input {...register(field)} placeholder="https://..." />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700 flex-1">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={deleteBrand} disabled={deleting} className="text-red-600 border-red-200 hover:bg-red-50">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    </form>
  );
}
