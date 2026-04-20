"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Campaign, Brand, Post, SocialConnection, Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar, Send, CheckCircle, AlertCircle, Loader2,
  ChevronLeft, Clock, ArrowRight
} from "lucide-react";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import { toast } from "sonner";
import { format, addDays, setHours, setMinutes } from "date-fns";

type CampaignWithAll = Campaign & {
  brand: Brand & { connections: SocialConnection[] };
  posts: Post[];
};

interface Props { campaign: CampaignWithAll }

export function SchedulePageClient({ campaign }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(campaign.posts);
  const [bulkDate, setBulkDate] = useState("");
  const [bulkTime, setBulkTime] = useState("09:00");
  const [publishing, setPublishing] = useState<Set<string>>(new Set());
  const [schedulingAll, setSchedulingAll] = useState(false);

  const connections = campaign.brand.connections;

  const getConnection = (platform: Platform) =>
    connections.find((c) => c.platform === platform);

  const schedulePost = async (postId: string, scheduledAt: string) => {
    const res = await fetch(`/api/posts/${postId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt }),
    });
    if (!res.ok) throw new Error("Failed to schedule");
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const publishNow = async (postId: string) => {
    setPublishing((prev) => new Set([...prev, postId]));
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Publish failed");
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "PUBLISHED" } : p)));
      toast.success("Post published successfully!");
    } catch (err) {
      toast.error("Failed to publish post");
    } finally {
      setPublishing((prev) => { const n = new Set(prev); n.delete(postId); return n; });
    }
  };

  const scheduleAll = async () => {
    if (!bulkDate) { toast.error("Please select a start date"); return; }
    setSchedulingAll(true);
    try {
      const draftPosts = posts.filter((p) => p.status === "DRAFT");
      const [hours, mins] = bulkTime.split(":").map(Number);

      for (let i = 0; i < draftPosts.length; i++) {
        // Space posts out: every other day, cycling through 9am, 12pm, 3pm, 6pm
        const dayOffset = Math.floor(i / 4);
        const timeSlots = [9, 12, 15, 18];
        const slotHour = timeSlots[i % 4];
        const date = setHours(setMinutes(addDays(new Date(bulkDate), dayOffset), 0), slotHour);
        await schedulePost(draftPosts[i].id, date.toISOString());
      }
      toast.success(`Scheduled ${draftPosts.length} posts!`);
    } catch {
      toast.error("Some posts failed to schedule");
    } finally {
      setSchedulingAll(false);
    }
  };

  const scheduledCount = posts.filter((p) => p.status === "SCHEDULED").length;
  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule & publish</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} posts · {campaign.brand.name}</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/create/${campaign.id}/preview`)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Preview
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Draft", count: draftCount, color: "text-gray-600" },
          { label: "Scheduled", count: scheduledCount, color: "text-blue-600" },
          { label: "Published", count: publishedCount, color: "text-green-600" },
        ].map(({ label, count, color }) => (
          <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Bulk schedule */}
      {draftCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Schedule all posts at once</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Set a start date and AI will spread your {draftCount} posts evenly across the month.
            </p>
            <div className="flex gap-3 flex-wrap">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Start date</label>
                <Input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} className="w-auto" min={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <Button
              onClick={scheduleAll}
              disabled={schedulingAll || !bulkDate}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {schedulingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              {schedulingAll ? "Scheduling..." : `Schedule all ${draftCount} posts`}
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Individual posts */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Posts</h3>
        {posts.map((post) => {
          const connection = getConnection(post.platform as Platform);
          const isPublishing = publishing.has(post.id);

          return (
            <div key={post.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl">
              {/* Platform indicator */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-1 sm:mt-0"
                style={{ backgroundColor: PLATFORM_COLORS[post.platform as Platform] }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">{PLATFORM_LABELS[post.platform as Platform]}</span>
                  <PostStatusBadge status={post.status} />
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{post.copyText}</p>
                {post.scheduledAt && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(post.scheduledAt), "d MMM yyyy 'at' HH:mm")}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {post.status === "DRAFT" && (
                  <>
                    <Input
                      type="datetime-local"
                      className="text-xs h-8 w-auto"
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={async (e) => {
                        if (e.target.value) {
                          try {
                            await schedulePost(post.id, new Date(e.target.value).toISOString());
                            toast.success("Post scheduled");
                          } catch {
                            toast.error("Failed to schedule");
                          }
                        }
                      }}
                    />
                    {connection && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => publishNow(post.id)}
                        disabled={isPublishing}
                        className="text-xs h-8 whitespace-nowrap"
                      >
                        {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                        Publish now
                      </Button>
                    )}
                  </>
                )}

                {post.status === "SCHEDULED" && connection && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => publishNow(post.id)}
                    disabled={isPublishing}
                    className="text-xs h-8 whitespace-nowrap"
                  >
                    {isPublishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                    Publish now
                  </Button>
                )}

                {!connection && post.status !== "PUBLISHED" && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                    Not connected
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Done button */}
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

function PostStatusBadge({ status }: { status: string }) {
  const config = {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
    SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-700" },
    PUBLISHING: { label: "Publishing...", className: "bg-yellow-100 text-yellow-700" },
    PUBLISHED: { label: "Published", className: "bg-green-100 text-green-700" },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
    CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500" },
  }[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
