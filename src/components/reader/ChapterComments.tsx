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

type CommentsProps = {
  id: string;
  provider?: string;
  type?: "chapter" | "series";
  theme?: "white" | "gray" | "black";
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

export default function Comments({ id, provider = "shinigami", type = "chapter", theme = "white" }: CommentsProps) {
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
      const res = await fetch(`/api/comments/${id}?provider=${provider}&type=${type}&page=${pageNum}&pageSize=10`);
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
  }, [id, type]);

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
      case "black": return "bg-transparent text-zinc-300";
      case "gray": return "bg-transparent text-zinc-100";
      case "white": default: return "bg-transparent text-slate-800";
    }
  };

  const getMutedText = () => {
    switch (theme) {
      case "black": return "text-zinc-500";
      case "gray": return "text-zinc-400";
      case "white": default: return "text-slate-500";
    }
  };

  const getBorderColor = () => {
    switch (theme) {
      case "black": return "border-[#1c1f27]";
      case "gray": return "border-zinc-800/80";
      case "white": default: return "border-slate-200";
    }
  };

  const getBodyTextColor = () => {
    switch (theme) {
      case "black": return "text-zinc-300";
      case "gray": return "text-zinc-200";
      case "white": default: return "text-slate-700";
    }
  };

  // Fallback avatar generator
  const renderAvatar = (nick: string, avatarUrl: string) => {
    const initials = nick ? nick.trim().charAt(0).toUpperCase() : "?";
    
    return (
      <div className="relative h-9 w-9 md:h-10 md:w-10 shrink-0">
        <img
          src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
          alt={nick}
          className="h-full w-full rounded-full object-cover border border-border-dark/5"
          onError={(e) => {
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
      <div className="flex flex-col gap-2.5 transition-all">
        {/* Commenter info header */}
        <div className="flex items-center gap-3">
          {renderAvatar(item.nick, item.avatar)}
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{item.nick}</span>
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
            
            <div className="flex items-center gap-1.5 text-[11px] text-muted-text font-medium mt-0.5">
              <span>{formatCommentTime(item.time)}</span>
              {item.reply_user && (
                <span className={`${getMutedText()} ml-0.5`}>
                  · replied to <span className="text-foreground font-semibold">@{item.reply_user.nick}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Comment Content body */}
        <div 
          className={`text-[14px] ${getBodyTextColor()} font-medium pl-0 md:pl-[52px] leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none`}
          dangerouslySetInnerHTML={{ __html: item.comment }}
        />

        {/* Action toolbar */}
        <div className="flex items-center gap-4 pl-0 md:pl-[52px] mt-0.5 text-[12px] font-bold">
          <div className={`flex items-center gap-1.5 cursor-pointer hover:text-accent-green transition-colors ${item.like > 0 ? "text-accent-green" : getMutedText()}`}>
            <ThumbsUp className="h-3.5 w-3.5 active:scale-90 transition-transform" />
            <span>{item.like > 0 ? item.like : ""}</span>
          </div>
        </div>

        {/* Render child replies */}
        {hasReplies && (
          <div className={`flex flex-col gap-5 mt-4 pl-4 md:pl-[52px] border-l-[2px] ${theme === 'white' ? 'border-slate-100' : 'border-zinc-800/80'}`}>
            {item.children!.map((reply) => (
              <CommentCard key={reply.objectId} item={reply} isChild={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-[800px] mx-auto flex flex-col gap-8 py-8 ${getContainerBg()}`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between pb-3 border-b ${getBorderColor()}`}>
        <h3 className="text-lg md:text-xl font-display font-extrabold flex items-center gap-2 text-foreground">
          <span>Comments</span>
          <span className="text-muted-text text-sm md:text-base font-bold bg-surface px-2.5 py-0.5 rounded-full">{totalCount}</span>
        </h3>
        
        <button
          onClick={() => fetchComments(1, false)}
          className={`p-2 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            theme === "white"
              ? "hover:bg-slate-100 text-slate-500"
              : "hover:bg-surface-hover text-muted-text hover:text-accent-green"
          }`}
          title="Refresh Comments"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-accent-green" : ""}`} />
        </button>
      </div>

      {/* Main Comment area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <RefreshCw className="h-6 w-6 text-accent-green animate-spin" />
          <p className="text-xs text-muted-text font-medium">Loading comments...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 flex flex-col items-center gap-3">
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
        <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${theme === 'white' ? 'bg-slate-50' : 'bg-surface'}`}>
            <MessageSquare className={`h-5 w-5 ${getMutedText()}`} />
          </div>
          <h4 className="text-sm font-bold text-foreground">No comments yet</h4>
          <p className="text-xs text-muted-text max-w-xs leading-relaxed font-medium">
            Be the first to share your thoughts on this chapter!
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {comments.map((item, index) => (
            <div key={item.objectId} className={`${index !== 0 ? `pt-6 mt-6 border-t ${getBorderColor()}` : ''}`}>
              <CommentCard item={item} />
            </div>
          ))}

          {/* Load More Button */}
          {page < totalPages && (
            <button
              disabled={isLoadingMore}
              onClick={handleLoadMore}
              className={`w-full mt-8 h-11 rounded-full border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                theme === "white"
                  ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                  : "bg-surface border-border-dark/60 hover:bg-surface-hover text-foreground hover:text-accent-green"
              }`}
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-accent-green" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Show More Comments</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
