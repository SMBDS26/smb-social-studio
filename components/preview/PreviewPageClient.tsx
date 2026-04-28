"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Campaign, Brand, Post, SocialConnection, Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, ArrowRight, Edit3, Check } from "lucide-react";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import { InstagramMockup } from "./mockups/InstagramMockup";
import { FacebookMockup } from "./mockups/FacebookMockup";
import { LinkedInMockup } from "./mockups/LinkedInMockup";
import { TwitterMockup } from "./mockups/TwitterMockup";
import { TikTokMockup } from "./mockups/TikTokMockup";
import { PostEditPanel } from "./PostEditPanel";
import { toast } from "sonner";

type CampaignWithAll = Campaign & {
  brand: Brand & { connections: SocialConnection[] };
  posts: Post[];
};

interface Props {
  campaign: CampaignWithAll;
}

export function PreviewPageClient({ campaign }: Props) {
  const router = useRouter();
  const platforms = [...new Set(campaign.posts.map((p) => p.platform))] as Platform[];
  const [activePlatform, setActivePlatform] = useState<Platform>(platforms[0] ?? "INSTAGRAM");
  const [postIndex, setPostIndex] = useState(0);
  const [posts, setPosts] = useState(campaign.posts);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const platformPosts = posts.filter((p) => p.platform === activePlatform);
  const currentPost = platformPosts[postIndex];

  const handlePlatformChange = (p: Platform) => {
    setActivePlatform(p);
    setPostIndex(0);
    setEditingPost(null);
  };

  const handleSavePost = async (updatedPost: Partial<Post>) => {
    if (!currentPost) return;
    try {
      const res = await fetch(`/api/posts/${currentPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setSavedIds((prev) => new Set([...prev, saved.id]));
      setEditingPost(null);
      toast.success("Post updated");
    } catch {
      toast.error("Failed to save changes");
    }
  };

  if (platforms.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No posts generated yet.</p>
        <Button className="mt-4" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preview & edit</h1>
          <p className="text-gray-500 text-sm mt-1">
            {posts.length} posts · {campaign.brand.name}
          </p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => router.push(`/create/${campaign.id}/schedule`)}
        >
          Export content <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Platform tabs */}
      <Tabs value={activePlatform} onValueChange={(v) => handlePlatformChange(v as Platform)}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {platforms.map((platform) => {
            const count = posts.filter((p) => p.platform === platform).length;
            return (
              <TabsTrigger
                key={platform}
                value={platform}
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm border data-[state=active]:border-violet-200"
                style={{ borderLeftColor: activePlatform === platform ? PLATFORM_COLORS[platform] : undefined, borderLeftWidth: activePlatform === platform ? 3 : undefined }}
              >
                <span
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                />
                {PLATFORM_LABELS[platform]}
                <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Main content */}
      {currentPost && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mockup */}
          <div className="lg:col-span-2 flex flex-col items-center">
            {/* Post navigator */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPostIndex((i) => Math.max(0, i - 1))}
                disabled={postIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Post {postIndex + 1} of {platformPosts.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPostIndex((i) => Math.min(platformPosts.length - 1, i + 1))}
                disabled={postIndex === platformPosts.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Platform mockup */}
            <div className="w-full max-w-sm">
              {activePlatform === "INSTAGRAM" && <InstagramMockup post={currentPost} brand={campaign.brand} />}
              {activePlatform === "FACEBOOK" && <FacebookMockup post={currentPost} brand={campaign.brand} />}
              {activePlatform === "LINKEDIN" && <LinkedInMockup post={currentPost} brand={campaign.brand} />}
              {activePlatform === "TWITTER" && <TwitterMockup post={currentPost} brand={campaign.brand} />}
              {activePlatform === "TIKTOK" && <TikTokMockup post={currentPost} brand={campaign.brand} />}
            </div>

            {/* Post dots navigation */}
            <div className="flex gap-1.5 mt-4">
              {platformPosts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPostIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === postIndex ? "bg-violet-600" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Edit panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Edit post</h3>
              {savedIds.has(currentPost.id) && (
                <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                  <Check className="w-3 h-3 mr-1" /> Saved
                </Badge>
              )}
            </div>
            <PostEditPanel
              post={currentPost}
              platform={activePlatform}
              onSave={handleSavePost}
              campaignId={campaign.id}
            />
          </div>
        </div>
      )}

      {/* All posts summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900">All posts ({posts.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {posts.map((post, i) => {
              const pIndex = posts.filter((p, j) => p.platform === post.platform && j < i).length;
              return (
                <button
                  key={post.id}
                  onClick={() => {
                    setActivePlatform(post.platform as Platform);
                    setPostIndex(pIndex);
                  }}
                  className="text-left p-2.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[post.platform as Platform] }} />
                    <span className="text-xs font-medium text-gray-500">{PLATFORM_LABELS[post.platform as Platform]}</span>
                    {savedIds.has(post.id) && <Check className="w-3 h-3 text-green-500 ml-auto" />}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{post.copyText}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
