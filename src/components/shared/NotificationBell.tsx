"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      setNotifications(json.notifications ?? []);
      setUnreadCount(json.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    const n = notifications.find(n => n.id === id);
    if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    setMarkingAll(false);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id);
    if (n.link) { router.push(n.link); setOpen(false); }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50"
              >
                {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group",
                    !n.read && "bg-violet-50/50 dark:bg-violet-950/20"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.read ? "bg-gray-300 dark:bg-gray-600" : "bg-violet-500")} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-relaxed", n.read ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-white font-medium")}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => deleteNotif(n.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
