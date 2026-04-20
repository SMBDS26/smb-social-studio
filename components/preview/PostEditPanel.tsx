"use client";

import { useState } from "react";
import type { Post, Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, RefreshCw, X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  LINKEDIN: 3000,
  TWITTER: 280,
  TIKTOK: 2200,
};

interface Props {
  post: Post;
  platform: Platform;
  onSave: (updated: Partial<Post>) => Promise<void>;
  campaignId: string;
}

export function PostEditPanel({ post, platform, onSave, campaignId }: Props) {
  const [copyText, setCopyText] = useState(post.copyText);
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags as string[]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [ctaLabel, setCtaLabel] = useState(post.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = useState(post.ctaUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const limit = PLATFORM_CHAR_LIMITS[platform];
  const charCount = copyText.length;
  const overLimit = charCount > limit;

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#?/, "#");
    if (tag.length > 1 && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
      setHashtagInput("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ copyText, hashtags, ctaLabel: ctaLabel || null, ctaUrl: ctaUrl || null });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      // Regenerate just this post by patching with a new generation version signal
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationVersion: post.generationVersion + 1 }),
      });
      toast.info("Regeneration queued. Refresh to see the new version.");
    } catch {
      toast.error("Failed to regenerate");
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Copy text */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-600">Post copy</Label>
          <span className={`text-xs ${overLimit ? "text-red-500 font-medium" : "text-gray-400"}`}>
            {charCount}/{limit}
          </span>
        </div>
        <Textarea
          value={copyText}
          onChange={(e) => setCopyText(e.target.value)}
          rows={6}
          className={`text-sm resize-none ${overLimit ? "border-red-300 focus-visible:ring-red-400" : ""}`}
        />
        {overLimit && (
          <p className="text-xs text-red-500">
            {charCount - limit} characters over the limit for {platform}
          </p>
        )}
      </div>

      <Separator />

      {/* Hashtags */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-600">Hashtags</Label>
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
              {tag}
              <button onClick={() => setHashtags((prev) => prev.filter((h) => h !== tag))}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-1.5">
          <Input
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            placeholder="#addhashtag"
            className="text-sm h-8"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
          />
          <Button variant="outline" size="sm" onClick={addHashtag} className="h-8 px-2">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* CTA */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-600">Call to action (optional)</Label>
        <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Button label" className="text-sm h-8" />
        <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." className="text-sm h-8" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex-1 text-xs"
        >
          {regenerating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
          Regenerate
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving || overLimit}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-xs"
        >
          {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
