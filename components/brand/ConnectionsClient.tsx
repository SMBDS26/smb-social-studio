"use client";

import { useState } from "react";
import type { Brand, SocialConnection } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Link2Off, ExternalLink, ArrowRight } from "lucide-react";
import { PLATFORM_COLORS, PLATFORM_LABELS } from "@/types";
import type { Platform } from "@prisma/client";
import Link from "next/link";
import { toast } from "sonner";

type BrandWithConnections = Brand & { connections: SocialConnection[] };

interface PlatformInfo {
  platform: Platform;
  description: string;
  note?: string;
}

const PLATFORMS: PlatformInfo[] = [
  { platform: "FACEBOOK", description: "Facebook Pages — publish posts, stories, and carousels" },
  { platform: "INSTAGRAM", description: "Instagram Business — feed posts, reels, and stories" },
  { platform: "LINKEDIN", description: "LinkedIn Company Pages — professional posts and articles" },
  { platform: "TWITTER", description: "X (Twitter) — tweets and threads" },
  { platform: "TIKTOK", description: "TikTok — video content (publishes immediately only)", note: "Scheduling not supported by TikTok API" },
];

interface Props {
  brand: BrandWithConnections;
}

export function ConnectionsClient({ brand }: Props) {
  const [connections, setConnections] = useState(brand.connections);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const getConnection = (platform: Platform) =>
    connections.find((c) => c.platform === platform && c.isActive);

  const disconnect = async (connectionId: string) => {
    setDisconnecting(connectionId);
    try {
      const res = await fetch(`/api/brands/${brand.id}/connections/${connectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      toast.success("Account disconnected");
    } catch {
      toast.error("Failed to disconnect account");
    } finally {
      setDisconnecting(null);
    }
  };

  return (
    <div className="space-y-4">
      {PLATFORMS.map(({ platform, description, note }) => {
        const connection = getConnection(platform);
        const oauthPath = platform.toLowerCase();

        return (
          <Card key={platform} className={connection ? "border-green-200 bg-green-50/30" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Platform indicator */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${PLATFORM_COLORS[platform]}20` }}
                >
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] }} />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{PLATFORM_LABELS[platform]}</h3>
                    {connection && (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{description}</p>
                  {note && !connection && (
                    <p className="text-xs text-amber-600 mt-1">⚠ {note}</p>
                  )}
                  {connection && (
                    <p className="text-sm text-green-700 font-medium mt-1">{connection.platformName}</p>
                  )}
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {connection ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => disconnect(connection.id)}
                      disabled={disconnecting === connection.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    >
                      <Link2Off className="w-3 h-3 mr-1" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      asChild
                      className="text-xs"
                      style={{ backgroundColor: PLATFORM_COLORS[platform] }}
                    >
                      <a href={`/api/oauth/${oauthPath}/connect?brandId=${brand.id}`}>
                        Connect
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Continue button */}
      <div className="flex justify-end pt-2">
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/create">
            Start creating content <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
