"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Campaign, Brand, Post, SocialConnection, Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink, ChevronLeft, ArrowRight, Hash } from "lucide-react";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import { toast } from "sonner";

type CampaignWithAll = Campaign & {
  brand: Brand & { connections: SocialConnection[] };
  posts: Post[];
};

interface Props { campaign: CampaignWithAll }

const PLATFORM_POST_URLS: Record<string, string> = {
  INSTAGRAM: "https://www.instagram.com/",
  FACEBOOK: "https://www.facebook.com/",
  LINKEDIN: "https://www.linkedin.com/feed/",
  TWITTER: "https://x.com/compose/tweet",
  TIKTOK: "https://www.tiktok.com/upload",
};

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  INSTAGRAM: "Open Instagram → tap + → Post, then paste your caption",
  FACEBOOK: "Open Facebook → tap What's on your mind? then paste",
  LINKEDIN: "Open LinkedIn → tap Start a post, then paste",
  TWITTER: "Open X/Twitter → tap Post, then paste (280 char limit)",
  TIKTOK: "Open TikTok → tap + → Upload your video, then paste caption",
};

export function SchedulePageClient({ campaign }: Props) {
  const router = useRouter();
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());

  const platforms = [...new Set(campaign.posts.map((p) => p.platform))] as Platform[];

  const copyPost = (post: Post) => {
    const hashtags = post.hashtags as string[] | null;
    const text = [
      post.copyText,
      hashtags?.length ? "\n\n" + hashtags.map((h) => `#${h}`).join(" ") : "",
      post.ctaUrl ? `\n\n${post.ctaUrl}` : "",
    ].join("");

    navigator.clipboard.writeText(text.trim());
    setCopiedIds((prev) => new Set([...prev, post.id]));
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIds((prev) => { const n = new Set(prev); n.delete(post.id); return n; }), 2000);
  };

  const copyAll = (platformPosts: Post[]) => {
    const text = platformPosts.map((post, i) => {
      const tags = post.hashtags as string[] | null;
      const hashtags = tags?.length
        ? "\n" + tags.map((h) => `#${h}`).join(" ")
        : "";
      const cta = post.ctaUrl ? `\n${post.ctaUrl}` : "";
      return `--- Post ${i + 1} ---\n${post.copyText}${hashtags}${cta}`;
    }).join("\n\n");

    navigator.clipboard.writeText(text);
    toast.success(`Copied all ${platformPosts.length} posts!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your content is ready</h1>
          <p className="text-gray-500 text-sm mt-1">
            {campaign.posts.length} posts for {platforms.length} platforms · {campaign.brand.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/create/${campaign.id}/preview`)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to preview
        </Button>
      </div>

      {/* Instruction banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <p className="text-sm text-violet-800 font-medium mb-1">How to post your content</p>
        <p className="text-sm text-violet-700">
          Copy each post below, then click the link to open that platform and paste it in.
          Your hashtags and links are included automatically.
        </p>
      </div>

      {/* Posts grouped by platform */}
      {platforms.map((platform) => {
        const platformPosts = campaign.posts.filter((p) => p.platform === platform);
        const color = PLATFORM_COLORS[platform];
        const label = PLATFORM_LABELS[platform];
        const postUrl = PLATFORM_POST_URLS[platform];
        const instruction = PLATFORM_INSTRUCTIONS[platform];

        return (
          <Card key={platform} className="overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <CardTitle className="text-base">{label}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{platformPosts.length} posts</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => copyAll(platformPosts)}
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copy all
                  </Button>
                  <a href={postUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="text-xs h-8" style={{ backgroundColor: color, borderColor: color }}>
                      Open {label} <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{instruction}</p>
            </CardHeader>
            <CardContent className="p-0">
              {platformPosts.map((post, i) => {
                const copied = copiedIds.has(post.id);
                const hashtags = post.hashtags as string[] | null;
                return (
                  <div key={post.id} className={`p-4 ${i < platformPosts.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1">Post {i + 1}</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.copyText}</p>
                        {hashtags && hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {hashtags.map((tag: string) => (
                              <span key={tag} className="text-xs text-violet-600 flex items-center gap-0.5">
                                <Hash className="w-2.5 h-2.5" />{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {post.ctaUrl && (
                          <p className="text-xs text-blue-500 mt-1">{post.ctaUrl}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-shrink-0 h-8 text-xs transition-colors ${copied ? "border-green-300 text-green-600 bg-green-50" : ""}`}
                        onClick={() => copyPost(post)}
                      >
                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <Separator />

      {/* Done */}
      <div className="flex justify-end pt-2">
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => router.push("/calendar")}
        >
          View calendar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
