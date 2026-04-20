"use client";

import type { Post, Brand } from "@prisma/client";
import { Heart, MessageCircle, Repeat2, BarChart2, Upload, MoreHorizontal } from "lucide-react";

interface Props { post: Post; brand: Brand }

export function TwitterMockup({ post, brand }: Props) {
  const mediaUrls = post.mediaUrls as string[];
  const text = post.copyText.length > 280 ? post.copyText.slice(0, 277) + "..." : post.copyText;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md max-w-[380px] w-full p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
          style={{ backgroundColor: brand.colorPrimary ?? "#000000" }}
        >
          {brand.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold text-sm text-gray-900">{brand.name}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-xs">2h</span>
            <MoreHorizontal className="w-4 h-4 text-gray-400 ml-auto" />
          </div>

          {/* Tweet text */}
          <p className="text-sm text-gray-900 leading-relaxed mb-2">{text}</p>

          {/* Image */}
          {mediaUrls.length > 0 && (
            <div className="rounded-xl overflow-hidden aspect-video mb-2 bg-gray-100">
              <img src={mediaUrls[0]} alt="Post" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between text-gray-500 mt-2">
            <button className="flex items-center gap-1 hover:text-blue-500 text-xs">
              <MessageCircle className="w-4 h-4" /> <span>24</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 text-xs">
              <Repeat2 className="w-4 h-4" /> <span>12</span>
            </button>
            <button className="flex items-center gap-1 hover:text-red-500 text-xs">
              <Heart className="w-4 h-4" /> <span>148</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 text-xs">
              <BarChart2 className="w-4 h-4" /> <span>2.4K</span>
            </button>
            <button className="hover:text-blue-500">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
