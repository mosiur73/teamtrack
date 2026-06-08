"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Send, Trash2, MessageSquare, Calendar,
  User, FolderKanban, Loader2, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, isOverdue } from "@/lib/utils";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; role: string };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string | null;
  project: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  _count: { comments: number };
}

const steps = [
  { key: "TODO", label: "Todo" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Done" },
] as const;

const priorityConfig = {
  HIGH: { label: "High Priority", class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  MEDIUM: { label: "Medium Priority", class: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  LOW: { label: "Low Priority", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

interface TaskDrawerProps {
  task: Task | null;
  userId: string;
  onClose: () => void;
}

export function TaskDrawer({ task, userId, onClose }: TaskDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!task) { setComments([]); return; }
    setLoading(true);
    fetch(`/api/tasks/${task.id}/comments`)
      .then(r => r.json())
      .then(j => setComments(j.comments ?? []))
      .finally(() => setLoading(false));
  }, [task?.id]);

  useEffect(() => {
    if (comments.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !task) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      setComments(prev => [...prev, json.comment]);
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!task) return;
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      setComments(prev => prev.filter(c => c.id !== commentId));
    } finally {
      setDeletingId(null);
    }
  };

  const stepIndex = steps.findIndex(s => s.key === task?.status);

  return (
    <>
      {task && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
        task ? "translate-x-0" : "translate-x-full"
      )}>
        {task && (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-violet-500 dark:text-violet-400 font-medium mb-1">{task.project.name}</p>
                <h2 className={cn(
                  "font-semibold text-gray-900 dark:text-white leading-snug",
                  task.status === "COMPLETED" && "line-through text-gray-400 dark:text-gray-500"
                )}>
                  {task.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Progress Steps */}
              <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Progress</p>
                <div className="flex items-center">
                  {steps.map((step, i) => {
                    const done = i <= stepIndex;
                    const active = i === stepIndex;
                    return (
                      <div key={step.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold",
                            done
                              ? "bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900"
                              : "border-gray-300 dark:border-gray-600 text-gray-300 dark:text-gray-600"
                          )}>
                            {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className={cn(
                            "text-[10px] font-medium whitespace-nowrap",
                            active
                              ? "text-violet-600 dark:text-violet-400"
                              : done
                              ? "text-violet-500"
                              : "text-gray-400 dark:text-gray-500"
                          )}>
                            {step.label}
                          </span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={cn(
                            "flex-1 h-0.5 mb-5 mx-1.5 rounded-full",
                            i < stepIndex ? "bg-violet-600" : "bg-gray-200 dark:bg-gray-700"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
                <div>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", priorityConfig[task.priority].class)}>
                    {priorityConfig[task.priority].label}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{task.description}</p>
                )}

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                    <FolderKanban className="w-4 h-4 shrink-0 text-gray-400" />
                    <span>{task.project.name}</span>
                  </div>
                  {task.assignedTo && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4 shrink-0 text-gray-400" />
                      <span>Assigned to <span className="font-medium text-gray-900 dark:text-white">{task.assignedTo.name}</span></span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-2.5 text-sm",
                      isOverdue(task.dueDate) && task.status !== "COMPLETED" ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                    )}>
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        {isOverdue(task.dueDate) && task.status !== "COMPLETED" ? "Overdue · " : "Due "}
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-xs text-gray-400 dark:text-gray-500">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Created by {task.createdBy.name}</span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Comments
                    {comments.length > 0 && (
                      <span className="ml-1.5 text-xs text-gray-400 font-normal">({comments.length})</span>
                    )}
                  </h3>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No comments yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="flex gap-3 group/comment">
                        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {getInitials(c.user.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{c.user.name}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(c.createdAt)}</span>
                            </div>
                            {c.user.id === userId && (
                              <button
                                onClick={() => handleDelete(c.id)}
                                disabled={deletingId === c.id}
                                className="opacity-0 group-hover/comment:opacity-100 p-1 rounded-lg text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all"
                              >
                                {deletingId === c.id
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <Trash2 className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input */}
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write a comment..."
                  maxLength={1000}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || submitting}
                  className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
