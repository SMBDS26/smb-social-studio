"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { BrandToneSelector } from "./BrandToneSelector";
import { BrandColorPicker } from "./BrandColorPicker";
import { AudienceBuilder } from "./AudienceBuilder";
import { INDUSTRIES } from "@/types";
import type { BrandTone } from "@prisma/client";

const steps = [
  { id: 1, title: "Identity", description: "Business basics" },
  { id: 2, title: "Style", description: "Colours & tone" },
  { id: 3, title: "Audience", description: "Who you serve" },
  { id: 4, title: "Socials", description: "Profile links" },
];

interface FormData {
  name: string;
  industry: string;
  websiteUrl: string;
  businessSummary: string;
  colorPrimary: string;
  colorSecondary: string;
  tone: BrandTone;
  audiences: { id: string; label: string; notes: string }[];
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  tiktokUrl: string;
}

export function BrandOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [brandData, setBrandData] = useState<Partial<FormData>>({
    tone: "FRIENDLY",
    colorPrimary: "#7C3AED",
    colorSecondary: "#A78BFA",
    audiences: [],
  });

  const next = (data: Partial<FormData>) => {
    setBrandData((prev) => ({ ...prev, ...data }));
    if (step < 4) setStep(step + 1);
    else handleSubmit({ ...brandData, ...data } as FormData);
  };

  const handleSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          targetAudiences: data.audiences ?? [],
        }),
      });

      if (!res.ok) throw new Error("Failed to create brand");
      const brand = await res.json();
      toast.success("Brand created successfully!");
      router.push(`/brands/${brand.id}/connections`);
    } catch (err) {
      toast.error("Failed to create brand. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > s.id
                    ? "bg-violet-600 text-white"
                    : step === s.id
                    ? "bg-violet-600 text-white ring-4 ring-violet-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-400">{s.description}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-violet-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {step === 1 && (
            <Step1
              data={brandData}
              onNext={(d) => next(d)}
            />
          )}
          {step === 2 && (
            <Step2
              data={brandData}
              onNext={(d) => next(d)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3
              data={brandData}
              onNext={(d) => next(d)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <Step4
              data={brandData}
              onNext={(d) => next(d)}
              onBack={() => setStep(3)}
              saving={saving}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── STEP 1: IDENTITY ────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, "Business name is required"),
  industry: z.string().min(1, "Please select an industry"),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  businessSummary: z.string().min(20, "Please write at least 20 characters"),
});

function Step1({ data, onNext }: { data: Partial<FormData>; onNext: (d: Partial<FormData>) => void }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: data.name ?? "",
      industry: data.industry ?? "",
      websiteUrl: data.websiteUrl ?? "",
      businessSummary: data.businessSummary ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tell us about your business</h2>
        <p className="text-gray-500 text-sm mt-1">This helps AI write content that truly represents you.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Business name *</Label>
        <Input id="name" placeholder="e.g. Bloom & Grow Florists" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("industry")}
        >
          <option value="">Select your industry...</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input id="websiteUrl" placeholder="https://yourwebsite.com" {...register("websiteUrl")} />
        {errors.websiteUrl && <p className="text-sm text-red-500">{errors.websiteUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessSummary">
          Business summary *
          <span className="text-gray-400 font-normal ml-1">(what you do, who you serve, what makes you different)</span>
        </Label>
        <Textarea
          id="businessSummary"
          placeholder="We're a family-run florist in Edinburgh specialising in wedding and event floristry. We pride ourselves on sustainable, locally-sourced blooms and a personal, stress-free service..."
          rows={4}
          {...register("businessSummary")}
        />
        {errors.businessSummary && <p className="text-sm text-red-500">{errors.businessSummary.message}</p>}
      </div>

      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </form>
  );
}

// ─── STEP 2: STYLE ────────────────────────────────────────────────────────────

function Step2({ data, onNext, onBack }: { data: Partial<FormData>; onNext: (d: Partial<FormData>) => void; onBack: () => void }) {
  const [colorPrimary, setColorPrimary] = useState(data.colorPrimary ?? "#7C3AED");
  const [colorSecondary, setColorSecondary] = useState(data.colorSecondary ?? "#A78BFA");
  const [tone, setTone] = useState<BrandTone>(data.tone ?? "FRIENDLY");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Brand style</h2>
        <p className="text-gray-500 text-sm mt-1">Help AI match your visual identity and voice.</p>
      </div>

      <div className="space-y-4">
        <Label>Brand colours</Label>
        <div className="flex gap-4">
          <BrandColorPicker label="Primary colour" value={colorPrimary} onChange={setColorPrimary} />
          <BrandColorPicker label="Secondary colour" value={colorSecondary} onChange={setColorSecondary} />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Brand tone of voice</Label>
        <BrandToneSelector value={tone} onChange={setTone} />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          className="flex-1 bg-violet-600 hover:bg-violet-700"
          onClick={() => onNext({ colorPrimary, colorSecondary, tone })}
        >
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 3: AUDIENCE ─────────────────────────────────────────────────────────

function Step3({ data, onNext, onBack }: { data: Partial<FormData>; onNext: (d: Partial<FormData>) => void; onBack: () => void }) {
  const [audiences, setAudiences] = useState(data.audiences ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Target audiences</h2>
        <p className="text-gray-500 text-sm mt-1">
          Who are you trying to reach? AI uses this to write for the right people.
        </p>
      </div>

      <AudienceBuilder value={audiences} onChange={setAudiences} />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          className="flex-1 bg-violet-600 hover:bg-violet-700"
          onClick={() => onNext({ audiences })}
        >
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 4: SOCIAL LINKS ─────────────────────────────────────────────────────

function Step4({ data, onNext, onBack, saving }: { data: Partial<FormData>; onNext: (d: Partial<FormData>) => void; onBack: () => void; saving: boolean }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      instagramUrl: data.instagramUrl ?? "",
      facebookUrl: data.facebookUrl ?? "",
      linkedinUrl: data.linkedinUrl ?? "",
      twitterUrl: data.twitterUrl ?? "",
      tiktokUrl: data.tiktokUrl ?? "",
    },
  });

  const socialFields = [
    { name: "instagramUrl" as const, label: "Instagram", placeholder: "https://instagram.com/yourbusiness", color: "#E1306C" },
    { name: "facebookUrl" as const, label: "Facebook", placeholder: "https://facebook.com/yourbusiness", color: "#1877F2" },
    { name: "linkedinUrl" as const, label: "LinkedIn", placeholder: "https://linkedin.com/company/yourbusiness", color: "#0A66C2" },
    { name: "twitterUrl" as const, label: "X (Twitter)", placeholder: "https://twitter.com/yourbusiness", color: "#000000" },
    { name: "tiktokUrl" as const, label: "TikTok", placeholder: "https://tiktok.com/@yourbusiness", color: "#010101" },
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Social media profiles</h2>
        <p className="text-gray-500 text-sm mt-1">
          Add your profile links. You&apos;ll connect them to publish directly in the next step.
        </p>
      </div>

      {socialFields.map(({ name, label, placeholder, color }) => (
        <div key={name} className="space-y-2">
          <Label htmlFor={name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            {label}
            <Badge variant="outline" className="text-xs font-normal text-gray-400">optional</Badge>
          </Label>
          <Input id={name} placeholder={placeholder} {...register(name)} />
        </div>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" type="button" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {saving ? "Creating brand..." : "Create brand →"}
        </Button>
      </div>
    </form>
  );
}
