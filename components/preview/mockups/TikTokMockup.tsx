"use client";

import type { Post, Brand } from "@prisma/client";
import { Heart, MessageCircle, Share2, Music2, Plus } from "lucide-react";

interface Props { post: Post; brand: Brand }

export function TikTokMockup({ post, brand }: Props) {
  const mediaUrls = post.mediaUrls as string[];
  const hashtags = (post.hashtags as string[]).join(" ");
  const caption = `${post.copyText.slice(0, 100)}${post.copyText.length > 100 ? "..." : ""}`;

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl max-w-[240px] w-full mx-auto" style={{ aspectRatio: "9/16" }}>
      {/* Background */}
      {mediaUrls.length > 0 ? (
        <video src={mediaUrls[0]} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${brand.colorPrimary ?? "#010101"} 0%, #1a1a2e 100%)` }}
        >
          <p className="text-white text-4xl font-bold opacity-10">{brand.name[0]}</p>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Right sidebar actions */}
      <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: brand.colorPrimary ?? "#010101" }}
          >
            {brand.name[0]}
            <div className="absolute -bottom-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-white">
          <Heart className="w-7 h-7" />
          <span className="text-xs">1.2K</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <MessageCircle className="w-7 h-7" />
          <span className="text-xs">84</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <Share2 className="w-7 h-7" />
          <span className="text-xs">Share</span>
        </div>
        <div className="w-8 h-8 rounded-full border-4 border-gray-600 bg-black flex items-center justify-center animate-spin">
          <Music2 className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-3 left-3 right-14 text-white">
        <p className="text-sm font-bold mb-1">@{brand.name.toLowerCase().replace(/\s+/g, "")}</p>
        <p className="text-xs leading-relaxed line-clamp-2">{caption}</p>
        {hashtags && (
          <p className="text-xs text-white/80 mt-1 line-clamp-1">{hashtags}</p>
        )}
        <div className="flex items-center gap-1 mt-2">
          <Music2 className="w-3 h-3" />
          <p className="text-xs">Original sound · {brand.name}</p>
        </div>
      </div>

      {/* TikTok note banner */}
      <div className="absolute top-3 left-3 right-3 bg-amber-500/90 rounded-lg px-2 py-1">
        <p className="text-xs text-white font-medium">TikTok posts immediately on publish</p>
      </div>
    </div>
  );
}
