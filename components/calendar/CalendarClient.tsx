"use client";

import { useState } from "react";
import type { Post, Campaign, Brand, Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import Link from "next/link";

type PostWithCampaign = Post & { campaign: Campaign & { brand: Brand } };

interface Props { posts: PostWithCampaign[] }

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarClient({ posts }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<PostWithCampaign | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month
  const startDayOfWeek = (monthStart.getDay() + 6) % 7; // Mon = 0
  const paddedDays = [...Array(startDayOfWeek).fill(null), ...days];

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content calendar</h1>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/create">
            <PlusCircle className="w-4 h-4 mr-2" /> Create content
          </Link>
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "TWITTER", "TIKTOK"] as Platform[]).map((platform) => {
          const count = posts.filter(
            (p) => p.platform === platform && p.scheduledAt && isSameMonth(new Date(p.scheduledAt), currentDate)
          ).length;
          if (count === 0) return null;
          return (
            <div key={platform} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] }} />
              <span className="text-xs text-gray-600">{count}</span>
              <span className="text-xs text-gray-400 hidden sm:block truncate">{PLATFORM_LABELS[platform]}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {paddedDays.map((day, i) => {
            if (!day) {
              return <div key={`pad-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/50" />;
            }

            const dayPosts = getPostsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] border-b border-r border-gray-100 p-1 ${
                  isToday ? "bg-violet-50" : ""
                }`}
              >
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-violet-600 text-white" : "text-gray-600"
                }`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 3).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="w-full text-left text-[10px] px-1 py-0.5 rounded truncate font-medium"
                      style={{
                        backgroundColor: `${PLATFORM_COLORS[post.platform as Platform]}20`,
                        color: PLATFORM_COLORS[post.platform as Platform],
                      }}
                    >
                      {PLATFORM_LABELS[post.platform as Platform].slice(0, 3)} · {post.copyText.slice(0, 15)}...
                    </button>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="text-[10px] text-gray-400 px-1">+{dayPosts.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected post detail */}
      {selectedPost && (
        <div className="fixed inset-x-4 bottom-4 sm:inset-auto sm:right-4 sm:bottom-4 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: PLATFORM_COLORS[selectedPost.platform as Platform] }}
              />
              <span className="font-medium text-sm">{PLATFORM_LABELS[selectedPost.platform as Platform]}</span>
              {selectedPost.scheduledAt && (
                <span className="text-xs text-gray-400">
                  {format(new Date(selectedPost.scheduledAt), "d MMM, HH:mm")}
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-700 line-clamp-4 mb-3">{selectedPost.copyText}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{selectedPost.campaign.brand.name}</span>
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: PLATFORM_COLORS[selectedPost.platform as Platform], color: PLATFORM_COLORS[selectedPost.platform as Platform] }}
            >
              {selectedPost.status}
            </Badge>
          </div>
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No scheduled posts yet.</p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/create">Create your first campaign</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
