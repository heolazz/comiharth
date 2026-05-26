"use client";

import { useEffect, useState } from "react";
import { MessageSquare, ThumbsUp, ChevronDown, ChevronUp, RefreshCw, Clock } from "lucide-react";

type ReplyUser = {
  nick: string;
  link: string;
  avatar: string;
};

type CommentItem = {
  status: string;
  comment: string; // HTML format
  link: string;
  nick: string;
  pid: number | null;
  rid: number | null;
  user_id: number;
  sticky: boolean | null;
  like: number;
  objectId: number;
  level: number;
  type: string;
  label: string | null;
  avatar: string;
  orig: string;
  time: number; // timestamp in ms
  children?: CommentItem[];
  reply_user?: ReplyUser;
};

type ChapterCommentsProps = {
  chapterId: string;
  theme: "white" | "gray" | "black";
};

function formatCommentTime(timestamp: number) {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return "Some time ago";
  }
}

export default function ChapterComments({ chapterId, theme }: ChapterCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = async (pageNum: number, append = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError("");

    try {
      const res = await fetch(`/api/comments/${chapterId}?page=${pageNum}&pageSize=10`);
      if (!res.ok) throw new Error("Failed to load comments from stream");
      const json = await res.json();

      if (json.success && json.data) {
        const responseData = json.data.data;
        const total = responseData.count || 0;
        const pages = responseData.totalPages || 1;
        const list = responseData.data || [];

        setTotalCount(total);
        setTotalPages(pages);
        
        if (append) {
          setComments((prev) => [...prev, ...list]);
        } else {
          setComments(list);
        }
      } else {
        throw new Error(json.error?.message || "Failed to parse comments payload");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading comments.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchComments(1, false);
  }, [chapterId]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  // Theme styling helpers
  const getContainerBg = () => {
    switch (theme) {
      case "black":
        return "bg-[#0b0c0e] border-[#16181d] text-zinc-300";
      case "gray":
        return "bg-zinc-900 border-zinc-800 text-zinc-100";
      case "white":
      default:
        return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  const getCardBg = () => {
    switch (theme) {
      case "black":
        return "bg-[#111317]/60 border-[#1a1d24]/60";
      case "gray":
        return "bg-zinc-800/50 border-zinc-700/40";
      case "white":
      default:
        return "bg-white border-slate-100";
    }
  };

  const getMutedText = () => {
    switch (theme) {
      case "black":
        return "text-zinc-500";
      case "gray":
        return "text-zinc-400";
      case "white":
      default:
        return "text-slate-500";
    }
  };

  const getBorderColor = () => {
    switch (theme) {
      case "black":
        return "border-[#1c1f27]";
      case "gray":
        return "border-zinc-700/60";
      case "white":
      default:
        return "border-slate-100";
    }
  };

  const getBodyTextColor = () => {
    switch (theme) {
      case "black":
        return "text-zinc-200";
      case "gray":
        return "text-zinc-100";
      case "white":
      default:
        return "text-slate-800";
    }
  };

  // Fallback avatar generator
  const renderAvatar = (nick: string, avatarUrl: string) => {
    const initials = nick ? nick.trim().charAt(0).toUpperCase() : "?";
    
    return (
      <div className="relative h-10 w-10 shrink-0">
        <img
          src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
          alt={nick}
          className="h-full w-full rounded-full object-cover border border-border-dark/10"
          onError={(e) => {
            // Hide the broken image and show placeholder
            e.currentTarget.style.display = "none";
            const placeholder = e.currentTarget.nextElementSibling as HTMLDivElement;
            if (placeholder) placeholder.style.display = "flex";
          }}
        />
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-green to-emerald-600 text-zinc-950 flex items-center justify-center text-sm font-black border border-accent-green/20"
          style={{ display: avatarUrl ? "none" : "flex" }}
        >
          {initials}
        </div>
      </div>
    );
  };

  // Recursive comment card component
  const CommentCard = ({ item, isChild = false }: { item: CommentItem; isChild?: boolean }) => {
    const hasReplies = item.children && item.children.length > 0;

    return (
      <div className={`flex flex-col gap-3 p-4 md:p-5 rounded-2xl border transition-all ${getCardBg()}`}>
        {/* Commenter info header */}
        <div className="flex items-center gap-3">
          {renderAvatar(item.nick, item.avatar)}
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-foreground">{item.nick}</span>
              {item.level > 0 && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-accent-green/10 text-accent-green border border-accent-green/20 px-1 rounded">
                  Lv. {item.level}
                </span>
              )}
              {item.type === "admin" && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 px-1 rounded">
                  Admin
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] text-muted-text font-bold mt-0.5">
              <Clock className="h-3 w-3" />
              <span>{formatCommentTime(item.time)}</span>
              {item.reply_user && (
                <span className={`${getMutedText()} ml-1 font-semibold`}>
                  replied to <span className="text-accent-green font-bold">@{item.reply_user.nick}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Comment Content body */}
        <div 
          className={`text-sm ${getBodyTextColor()} font-medium pl-0 md:pl-[52px] leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none`}
          dangerouslySetInnerHTML={{ __html: item.comment }}
        />

        {/* Action toolbar */}
        <div className="flex items-center gap-4 pl-0 md:pl-[52px] mt-1 text-[11px] font-extrabold">
          <div className={`flex items-center gap-1.5 ${item.like > 0 ? "text-accent-green" : getMutedText()}`}>
            <ThumbsUp className="h-3.5 w-3.5 cursor-pointer hover:scale-110 active:scale-90 transition-transform" />
            <span>{item.like}</span>
          </div>
        </div>

        {/* Render child replies */}
        {hasReplies && (
          <div className={`flex flex-col gap-4 mt-3 pl-4 md:pl-[52px] border-l-2 border-accent-green/15`}>
            {item.children!.map((reply) => (
              <CommentCard key={reply.objectId} item={reply} isChild={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-[900px] mx-auto rounded-3xl border p-6 md:p-8 flex flex-col gap-6 ${getContainerBg()}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-border-dark/15">
        <h3 className="text-lg md:text-xl font-display font-extrabold flex items-center gap-2 text-foreground">
          <MessageSquare className="h-5.5 w-5.5 text-accent-green" />
          <span>Comments ({totalCount})</span>
        </h3>
        
        <button
          onClick={() => fetchComments(1, false)}
          className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            theme === "white"
              ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-600"
              : "bg-surface border-border-dark/60 hover:bg-surface-hover text-muted-text hover:text-accent-green"
          }`}
          title="Refresh Comments"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-accent-green" : ""}`} />
        </button>
      </div>

      {/* Main Comment area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="h-8 w-8 text-accent-green animate-spin" />
          <p className="text-xs text-muted-text font-bold">Summoning comments thread...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 flex flex-col items-center gap-3">
          <div className="text-red-500 bg-red-500/5 px-4 py-2 rounded-xl border border-red-500/10 text-xs font-bold">
            {error}
          </div>
          <button
            onClick={() => fetchComments(1, false)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-accent-green hover:bg-green-600 text-xs font-bold text-white transition-colors mt-2"
          >
            <span>Retry Connection</span>
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-accent-green/5 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-accent-green" />
          </div>
          <h4 className="text-sm font-bold text-foreground">No comments yet</h4>
          <p className="text-xs text-muted-text max-w-xs leading-relaxed font-semibold">
            Be the first to share your thoughts on this chapter!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map((item) => (
            <CommentCard key={item.objectId} item={item} />
          ))}

          {/* Load More Button */}
          {page < totalPages && (
            <button
              disabled={isLoadingMore}
              onClick={handleLoadMore}
              className={`w-full mt-4 h-12 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                theme === "white"
                  ? "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 active:bg-slate-50"
                  : "bg-surface border-border-dark/60 hover:bg-surface-hover text-foreground hover:text-accent-green active:bg-surface"
              }`}
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-accent-green" />
                  <span>Loading more thoughts...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Load More Comments</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
