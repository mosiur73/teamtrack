"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FolderKanban, CheckSquare, Users, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/shared/Pagination";

interface Log {
  id: string;
  action: string;
  entityType: string;
  entityName: string | null;
  timestamp: string;
  user: { id: string; name: string; email: string };
  project: { id: string; name: string } | null;
}

const entityConfig: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  PROJECT: { label: "Project", icon: FolderKanban, cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" },
  TASK: { label: "Task", icon: CheckSquare, cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  TEAM: { label: "Team", icon: Users, cls: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
};

const ranges = [
  { value: "ALL", label: "All time" },
  { value: "TODAY", label: "Today" },
  { value: "WEEK", label: "This week" },
  { value: "MONTH", label: "This month" },
];

const types = [
  { value: "", label: "All types" },
  { value: "PROJECT", label: "Projects" },
  { value: "TASK", label: "Tasks" },
  { value: "TEAM", label: "Team" },
];

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const avatarColors = ["bg-violet-500", "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-pink-500"];
function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

const LIMIT = 10;

export function ActivityClient() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [range, setRange] = useState("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        range,
        ...(type && { type }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`/api/activity?${params}`);
      const json = await res.json();
      setLogs(json.logs ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, type, range, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [type, range, debouncedSearch]);

  // Group logs by date
  const grouped = logs.reduce<Record<string, Log[]>>((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {total} total activities recorded
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>

        {/* Type filter */}
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        >
          {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        {/* Date range */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                range === r.value
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No activities found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, dayLogs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800">
                  {date}
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              </div>

              {/* Log entries */}
              <div className="space-y-3">
                {dayLogs.map(log => {
                  const entity = entityConfig[log.entityType] ?? {
                    label: log.entityType, icon: Activity,
                    cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                  };
                  const Icon = entity.icon;

                  return (
                    <div key={log.id} className="flex gap-4 items-start group">
                      {/* Entity Icon */}
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", entity.cls)}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 group-hover:border-violet-200 dark:group-hover:border-violet-800 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{log.action}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          {/* User */}
                          <div className="flex items-center gap-1.5">
                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0", getAvatarColor(log.user.name))}>
                              {getInitials(log.user.name)}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{log.user.name}</span>
                          </div>

                          {/* Entity type badge */}
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", entity.cls)}>
                            {entity.label}
                          </span>

                          {/* Project */}
                          {log.project && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                              {log.project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
