"use client";

import Link from "next/link";
import { Building2, Calendar, Layers, PlusCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import type { Platform } from "@prisma/client";
import { format } from "date-fns";

interface Props {
  stats: { brandCount: number; campaignCount: number; scheduledCount: number };
  recentPosts: {
    id: string;
    platform: Platform;
    copyText: string;
    publishedAt: Date | null;
    campaign: { brand: { name: string } };
  }[];
  upcomingPosts: {
    id: string;
    platform: Platform;
    copyText: string;
    scheduledAt: Date | null;
    campaign: { brand: { name: string } };
  }[];
  userName: string;
}

const statCards = (stats: Props["stats"]) => [
  { label: "Brands", value: stats.brandCount, icon: Building2, href: "/brands" },
  { label: "Campaigns", value: stats.campaignCount, icon: Layers, href: "/brands" },
  { label: "Scheduled Posts", value: stats.scheduledCount, icon: Calendar, href: "/calendar" },
];

export function DashboardClient({ stats, recentPosts, upcomingPosts, userName }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {userName}! 👋</h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your social content.</p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/create">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Content
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards(stats).map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {stats.brandCount === 0 && (
        <Card className="border-dashed border-2 border-violet-200 bg-violet-50/50">
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Set up your first brand</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add your business details and connect your social accounts to get started.
            </p>
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/brands/new">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Brand
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Scheduled Posts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calendar">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No posts scheduled yet.{" "}
                <Link href="/create" className="text-violet-600 hover:underline">
                  Create content
                </Link>
              </p>
            ) : (
              upcomingPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: PLATFORM_COLORS[post.platform] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{post.copyText}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {PLATFORM_LABELS[post.platform]} · {post.campaign.brand.name}
                      {post.scheduledAt && ` · ${format(new Date(post.scheduledAt), "d MMM, HH:mm")}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent published */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recently Published</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No published posts yet.
              </p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Badge
                    variant="outline"
                    className="text-xs flex-shrink-0"
                    style={{ borderColor: PLATFORM_COLORS[post.platform], color: PLATFORM_COLORS[post.platform] }}
                  >
                    {PLATFORM_LABELS[post.platform]}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-1">{post.copyText}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.campaign.brand.name}
                      {post.publishedAt && ` · ${format(new Date(post.publishedAt), "d MMM")}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
