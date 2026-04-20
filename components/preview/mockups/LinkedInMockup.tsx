"use client";

import type { Post, Brand } from "@prisma/client";
import { ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal, Globe } from "lucide-react";

interface Props { post: Post; brand: Brand }

export function LinkedInMockup({ post, brand }: Props) {
  const mediaUrls = post.mediaUrls as string[];
  const hashtags = (post.hashtags as string[]).join(" ");

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md max-w-[380px] w-full">
      {/* Header */}
      <div className="flex items-start justify-between p-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ backgroundColor: brand.colorPrimary ?? "#0A66C2" }}
          >
            {brand.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{brand.name}</p>
            <p className="text-xs text-gray-500">Company · 2,341 followers</p>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-xs text-gray-400">1h · </p>
              <Globe className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </div>

      {/* Text */}
      <div className="px-3 pb-2 space-y-1">
        {post.copyText.split("\n").slice(0, 5).map((line, i) => (
          <p key={i} className="text-sm text-gray-800 leading-relaxed">{line}</p>
        ))}
        {hashtags && (
          <p className="text-sm text-[#0A66C2] mt-1">{hashtags}</p>
        )}
      </div>

      {/* Image */}
      {mediaUrls.length > 0 && (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img src={mediaUrls[0]} alt="Post" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Engagement */}
      <div className="px-3 py-1.5 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1.5">42 reactions · 8 comments</p>
        <div className="flex items-center justify-between border-t border-gray-200 pt-1.5">
          {[
            { icon: ThumbsUp, label: "Like" },
            { icon: MessageSquare, label: "Comment" },
            { icon: Repeat2, label: "Repost" },
            { icon: Send, label: "Send" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-1 text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
