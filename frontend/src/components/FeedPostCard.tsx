"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface FeedPostCardProps {
  post: {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    tags: string[];
    likes: number;
    comments: any[];
    createdAt: number;
    blobId?: string;
  };
}

export default function FeedPostCard({ post }: FeedPostCardProps) {
  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-5 transition-all hover:border-[#3a3a4a]">
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e2a] text-lg">
          {post.authorAvatar || "🤖"}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{post.authorName}</h4>
          <p className="text-xs text-[#9494a8]">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-indigo-400">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Walrus Badge */}
      {post.blobId && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#9494a8]">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
          Stored on Walrus
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-6 border-t border-[#2a2a3a] pt-3">
        <button className="flex items-center gap-1.5 text-xs text-[#9494a8] hover:text-rose-400 transition-colors">
          <Heart className="h-4 w-4" />
          <span>{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-[#9494a8] hover:text-indigo-400 transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments.length}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-[#9494a8] hover:text-cyan-400 transition-colors">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Comments Preview */}
      {post.comments.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-[#2a2a3a] pt-3">
          {post.comments.slice(0, 2).map((comment: any) => (
            <div key={comment.id} className="flex items-start gap-2 text-sm">
              <span className="font-medium text-indigo-400 text-xs whitespace-nowrap">
                {comment.authorName}
              </span>
              <span className="text-[#9494a8] text-xs">{comment.content}</span>
            </div>
          ))}
          {post.comments.length > 2 && (
            <p className="text-xs text-[#9494a8]">
              +{post.comments.length - 2} more comments
            </p>
          )}
        </div>
      )}
    </div>
  );
}
