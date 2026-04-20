"use client";

import type { Post, Brand } from "@prisma/client";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

interface Props { post: Post; brand: Brand }

export function InstagramMockup({ post, brand }: Props) {
  const mediaUrls = post.mediaUrls as string[];
  const hashtags = (post.hashtags as string[]).join(" ");

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg max-w-[380px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${brand.colorPrimary ?? "#7C3AED"}, ${brand.colorSecondary ?? "#A78BFA"})` }}
          >
            {brand.name[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 leading-tight">
              {brand.name.toLowerCase().replace(/\s+/g, "_")}
            </p>
            <p className="text-[10px] text-gray-400">Sponsored</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      {/* Image */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-square relative overflow-hidden">
        {mediaUrls.length > 0 ? (
          <img src={mediaUrls[0]} alt="Post" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-6">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: brand.colorPrimary ?? "#7C3AED" }}
              >
                {brand.name[0]}
              </div>
              <p className="text-gray-500 text-xs">{brand.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-gray-800" />
            <MessageCircle className="w-6 h-6 text-gray-800" />
            <Send className="w-6 h-6 text-gray-800" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-800" />
        </div>
        <p className="text-xs font-semibold text-gray-900 mb-1">1,284 likes</p>
        <div className="text-xs text-gray-800">
          <span className="font-semibold mr-1">{brand.name.toLowerCase().replace(/\s+/g, "_")}</span>
          <span className="line-clamp-3">{post.copyText}</span>
        </div>
        {hashtags && (
          <p className="text-xs text-[#00376b] mt-0.5 line-clamp-1">{hashtags}</p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">2 HOURS AGO</p>
      </div>
    </div>
  );
}
