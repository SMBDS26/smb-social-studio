"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, Tag,
  Megaphone, Users, FileText, Sparkles, Loader2, Image, Upload
} from "lucide-react";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import type { Brand, SocialConnection, Campaign, Platform } from "@prisma/client";
import { useDropzone } from "react-dropzone";

interface BriefWizardProps {
  campaign: Campaign;
  brand: Brand & { connections: SocialConnection[] };
}

const WIZARD_STEPS = [
  { id: 1, label: "Media", icon: Image },
  { id: 2, label: "Brief", icon: Sparkles },
  { id: 3, label: "Events", icon: Calendar },
  { id: 4, label: "Platforms", icon: Tag },
  { id: 5, label: "CTAs", icon: Megaphone },
];

function genId() { return Math.random().toString(36).slice(2, 9); }

export function BriefWizard({ campaign, brand }: BriefWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Brief data state
  const [mediaAssets, setMediaAssets] = useState<{ id: string; url: string; type: string; label: string }[]>([]);
  const [campaignName, setCampaignName] = useState("Monthly Social Media Calendar");
  const [postsPerPlatform, setPostsPerPlatform] = useState(4);
  const [keyDates, setKeyDates] = useState<{ id: string; date: string; label: string }[]>([]);
  const [newProducts, setNewProducts] = useState<string[]>([]);
  const [promos, setPromos] = useState<string[]>([]);
  const [staffHighlights, setStaffHighlights] = useState<string[]>([]);
  const [blogPosts, setBlogPosts] = useState<string[]>([]);
  const [companyUpdates, setCompanyUpdates] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    brand.connections.map((c) => c.platform as Platform)
  );
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [ctas, setCtas] = useState<{ id: string; label: string; url: string }[]>([
    { id: genId(), label: "Learn More", url: brand.websiteUrl ?? "" },
  ]);
  const [newCtaLabel, setNewCtaLabel] = useState("");
  const [newCtaUrl, setNewCtaUrl] = useState("");

  // For unconnected platforms display
  const allPlatforms: Platform[] = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "TWITTER", "TIKTOK"];
  const connectedPlatforms = brand.connections.map((c) => c.platform as Platform);

  const generateContent = async () => {
    setSaving(true);
    try {
      const briefData = {
        name: campaignName,
        platforms: selectedPlatforms,
        keyDates,
        newProducts,
        staffHighlights,
        blogPosts,
        promos,
        companyUpdates,
        hashtags,
        ctas,
        mediaAssets,
        postsPerPlatform,
      };

      // Save brief data
      await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefData, name: campaignName }),
      });

      router.push(`/create/${campaign.id}/generate`);
    } catch {
      toast.error("Failed to save brief. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Dropzone for media
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    maxFiles: 20,
    onDrop: (files) => {
      // In production, upload to R2. Here we use object URLs for preview.
      const newAssets = files.map((f) => ({
        id: genId(),
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video") ? "video" : "image",
        label: f.name,
      }));
      setMediaAssets((prev) => [...prev, ...newAssets]);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content brief</h1>
          <p className="text-gray-500 text-sm mt-1">for <span className="font-medium">{brand.name}</span></p>
        </div>
        <Button variant="outline" onClick={() => router.push("/create")}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1">
        {WIZARD_STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  step === s.id ? "bg-violet-600 text-white" :
                  step > s.id ? "bg-violet-100 text-violet-700 cursor-pointer" :
                  "bg-gray-100 text-gray-400"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? "bg-violet-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">

          {/* STEP 1: MEDIA */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Upload your media</h2>
                <p className="text-gray-500 text-sm">Images and videos you want to use in your posts. Optional — AI can suggest content without them.</p>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-violet-500 bg-violet-50" : "border-gray-300 hover:border-violet-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  {isDragActive ? "Drop files here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Images & videos · Up to 20 files</p>
              </div>

              {mediaAssets.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {mediaAssets.map((asset) => (
                    <div key={asset.id} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                      {asset.type === "image" ? (
                        <img src={asset.url} alt={asset.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <video src={asset.url} className="max-w-full max-h-full" />
                        </div>
                      )}
                      <button
                        onClick={() => setMediaAssets((prev) => prev.filter((a) => a.id !== asset.id))}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: BRIEF */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Campaign brief</h2>
                <p className="text-gray-500 text-sm">Tell AI what you want to achieve this month.</p>
              </div>

              <div className="space-y-2">
                <Label>Campaign name</Label>
                <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Posts per platform</Label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPostsPerPlatform(n)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        postsPerPlatform === n ? "border-violet-600 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">per platform, per month</p>
              </div>

              <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                <p className="text-sm text-violet-800">
                  <strong>AI will create:</strong> A full monthly social media calendar with platform-optimised content
                  tailored to <strong>{brand.name}&apos;s</strong> brand tone and target audience.
                  Add specifics below to make it even more relevant.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: EVENTS */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Key events & updates</h2>
                <p className="text-gray-500 text-sm">The more you share, the more relevant the content. All fields are optional.</p>
              </div>

              {/* Key dates */}
              <EventSection
                title="Key dates & events"
                icon={<Calendar className="w-4 h-4" />}
                hint="Promotions, launches, holidays, awareness days..."
              >
                <KeyDateInput items={keyDates} onAdd={(date, label) => setKeyDates(prev => [...prev, { id: genId(), date, label }])} onRemove={(id) => setKeyDates(prev => prev.filter(d => d.id !== id))} />
              </EventSection>

              {/* New products/services */}
              <EventSection title="New products or services" icon={<Sparkles className="w-4 h-4" />}>
                <TagInput items={newProducts} onChange={setNewProducts} placeholder="e.g. Summer collection launch" />
              </EventSection>

              {/* Promotions */}
              <EventSection title="Promotions or offers" icon={<Megaphone className="w-4 h-4" />}>
                <TagInput items={promos} onChange={setPromos} placeholder="e.g. 20% off all bookings in June" />
              </EventSection>

              {/* Staff highlights */}
              <EventSection title="Team or staff highlights" icon={<Users className="w-4 h-4" />}>
                <TagInput items={staffHighlights} onChange={setStaffHighlights} placeholder="e.g. Sarah joined as Head Florist" />
              </EventSection>

              {/* Blog posts */}
              <EventSection title="Blog posts or articles to promote" icon={<FileText className="w-4 h-4" />}>
                <TagInput items={blogPosts} onChange={setBlogPosts} placeholder="e.g. 5 tips for a stress-free wedding day" />
              </EventSection>

              {/* Company updates */}
              <EventSection title="Company updates" icon={<Tag className="w-4 h-4" />}>
                <TagInput items={companyUpdates} onChange={setCompanyUpdates} placeholder="e.g. New premises opening in July" />
              </EventSection>
            </div>
          )}

          {/* STEP 4: PLATFORMS */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Which platforms?</h2>
                <p className="text-gray-500 text-sm">Select the platforms you want content created for.</p>
              </div>

              <div className="space-y-2">
                {allPlatforms.map((platform) => {
                  const connected = connectedPlatforms.includes(platform);
                  const selected = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => {
                        setSelectedPlatforms(prev =>
                          selected ? prev.filter(p => p !== platform) : [...prev, platform]
                        );
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                        selected ? "border-violet-600 bg-violet-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                      />
                      <div className="flex-1">
                        <span className="font-medium text-sm text-gray-900">{PLATFORM_LABELS[platform]}</span>
                        {platform === "TIKTOK" && (
                          <span className="text-xs text-amber-600 ml-2">(video only)</span>
                        )}
                      </div>
                      {connected ? (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">Connected</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-400">Not connected</Badge>
                      )}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? "border-violet-600 bg-violet-600" : "border-gray-300"
                      }`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedPlatforms.length === 0 && (
                <p className="text-sm text-amber-600">Please select at least one platform.</p>
              )}
            </div>
          )}

          {/* STEP 5: HASHTAGS & CTAs */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Hashtags & calls to action</h2>
                <p className="text-gray-500 text-sm">Optional — AI will generate relevant ones if you leave these blank.</p>
              </div>

              <div className="space-y-3">
                <Label>Hashtags to include</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="#yourhashtag"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        const tag = hashtagInput.trim().replace(/^#?/, "#");
                        if (tag.length > 1 && !hashtags.includes(tag)) {
                          setHashtags(prev => [...prev, tag]);
                          setHashtagInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tag = hashtagInput.trim().replace(/^#?/, "#");
                      if (tag.length > 1 && !hashtags.includes(tag)) {
                        setHashtags(prev => [...prev, tag]);
                        setHashtagInput("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => setHashtags(prev => prev.filter(h => h !== tag))}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Call-to-action buttons</Label>
                <div className="space-y-2">
                  {ctas.map((cta) => (
                    <div key={cta.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 min-w-[80px]">{cta.label}</span>
                      <span className="text-xs text-gray-400 flex-1 truncate">{cta.url}</span>
                      <button onClick={() => setCtas(prev => prev.filter(c => c.id !== cta.id))}>
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Button label" value={newCtaLabel} onChange={(e) => setNewCtaLabel(e.target.value)} className="flex-1" />
                  <Input placeholder="URL" value={newCtaUrl} onChange={(e) => setNewCtaUrl(e.target.value)} className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newCtaLabel && newCtaUrl) {
                        setCtas(prev => [...prev, { id: genId(), label: newCtaLabel, url: newCtaUrl }]);
                        setNewCtaLabel(""); setNewCtaUrl("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {step < 5 ? (
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  if (step === 4 && selectedPlatforms.length === 0) {
                    toast.error("Please select at least one platform");
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={generateContent}
                disabled={saving || selectedPlatforms.length === 0}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Generate content with AI"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function EventSection({ title, icon, hint, children }: { title: string; icon: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <Label className="font-medium">{title}</Label>
        <Badge variant="outline" className="text-xs font-normal text-gray-400">optional</Badge>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

function TagInput({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    if (input.trim() && !items.includes(input.trim())) {
      onChange([...items, input.trim()]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 text-xs">
              {item.length > 40 ? item.slice(0, 40) + "..." : item}
              <button onClick={() => onChange(items.filter(i => i !== item))}><X className="w-3 h-3" /></button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function KeyDateInput({ items, onAdd, onRemove }: { items: { id: string; date: string; label: string }[]; onAdd: (date: string, label: string) => void; onRemove: (id: string) => void }) {
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Summer sale launch" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), date && label && (onAdd(date, label), setDate(""), setLabel("")))} />
        <Button type="button" variant="outline" size="sm" onClick={() => { if (date && label) { onAdd(date, label); setDate(""); setLabel(""); } }}><Plus className="w-4 h-4" /></Button>
      </div>
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500 text-xs font-mono">{item.date}</span>
              <span className="flex-1 text-gray-700">{item.label}</span>
              <button onClick={() => onRemove(item.id)}><X className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
