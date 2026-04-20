"use client";

import type { Post, Brand } from "@prisma/client";
import { ThumbsUp, MessageSquare, Share2, Globe, MoreHorizontal } from "lucide-react";

interface Props { post: Post; brand: Brand }

export function FacebookMockup({ post, brand }: Props) {
  const mediaUrls = post.mediaUrls as string[];

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md max-w-[380px] w-full font-[Arial,sans-serif]">
      {/* Header */}
      <div className="flex items-start justify-between p-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: brand.colorPrimary ?? "#1877F2" }}
          >
            {brand.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{brand.name}</p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-500">Just now · </p>
              <Globe className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500 mt-1" />
      </div>

      {/* Text */}
      <div className="px-3 pb-2">
        <p className="text-sm text-gray-800 leading-relaxed line-clamp-4">{post.copyText}</p>
        {post.ctaUrl && (
          <p className="text-sm text-[#1877F2] mt-1 break-all line-clamp-1">{post.ctaUrl}</p>
        )}
      </div>

      {/* Image */}
      {mediaUrls.length > 0 && (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img src={mediaUrls[0]} alt="Post" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Engagement bar */}
      <div className="px-3 py-1.5 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-[8px]">👍</span>
              <span className="w-4 h-4 rounded-full bg-[#F02849] flex items-center justify-center text-[8px]">❤️</span>
            </div>
            <span>247</span>
          </div>
          <span>18 comments</span>
        </div>
        <div className="flex items-center justify-around border-t border-gray-200 pt-1.5">
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded">
            <ThumbsUp className="w-4 h-4" /> Like
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded">
            <MessageSquare className="w-4 h-4" /> Comment
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
