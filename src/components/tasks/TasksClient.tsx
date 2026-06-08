"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, CheckSquare, Calendar,
  User, ChevronDown, Search, SlidersHorizontal, MessageSquare,
} from "lucide-react";
import { TaskModal } from "./TaskModal";
import { TaskDrawer } from "./TaskDrawer";
import { Pagination } from "@/components/shared/Pagination";
import { formatDate, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assignedToId: string | null;
  project: { id: string; name: string };
  assignedTo: { id: string; name: string; email: string; avatar: string | null } | null;
  createdBy: { id: string; name: string };
  _count: { comments: number };
}

const priorityConfig = {
  HIGH: { label: "High", class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  MEDIUM: { label: "Medium", class: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  LOW: { label: "Low", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
};

const statusConfig = {
  TODO: { label: "Todo", class: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  IN_PROGRESS: { label: "In Progress", class: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  COMPLETED: { label: "Completed", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
};

const statuses = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;
type SortKey = "latest" | "deadline" | "priority" | "updated";
const LIMIT = 10;

const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

interface TasksClientProps {
  tasks: Task[];
  canManage: boolean;
  userId: string;
  userRole: string;
}

export function TasksClient({ tasks: initial, canManage, userId }: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [projectFilter, setProjectFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState<"ALL" | "UPCOMING" | "OVERDUE">("ALL");
  const [sort, setSort] = useState<SortKey>("latest");

  const resetPage = () => setPage(1);

  // Unique projects + members for filter dropdowns
  const projects = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach(t => map.set(t.project.id, t.project.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const members = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach(t => { if (t.assignedTo) map.set(t.assignedTo.id, t.assignedTo.name); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const processed = useMemo(() => {
    let result = [...tasks];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== "ALL") result = result.filter(t => t.priority === priorityFilter);
    if (projectFilter) result = result.filter(t => t.project.id === projectFilter);
    if (assigneeFilter) result = result.filter(t => t.assignedTo?.id === assigneeFilter);
    if (deadlineFilter === "OVERDUE") result = result.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== "COMPLETED");
    if (deadlineFilter === "UPCOMING") result = result.filter(t => t.dueDate && !isOverdue(t.dueDate) && t.status !== "COMPLETED");

    result.sort((a, b) => {
      if (sort === "latest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sort === "deadline") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, projectFilter, assigneeFilter, deadlineFilter, sort]);

  const totalPages = Math.ceil(processed.length / LIMIT);
  const paginated = processed.slice((page - 1) * LIMIT, page * LIMIT);

  const refresh = async () => {
    const res = await fetch("/api/tasks");
    const json = await res.json();
    setTasks(json.tasks || []);
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete task "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      toast.success("Task deleted");
      setTasks(prev => prev.filter(t => t.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: "TODO" | "IN_PROGRESS" | "COMPLETED") => {
    if (task.status === newStatus) return;
    setUpdatingId(task.id);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success(`Moved to ${statusConfig[newStatus].label}`);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter("ALL"); setPriorityFilter("ALL");
    setProjectFilter(""); setAssigneeFilter(""); setDeadlineFilter("ALL");
    setSort("latest"); resetPage();
  };

  const hasActiveFilters = search || statusFilter !== "ALL" || priorityFilter !== "ALL" || projectFilter || assigneeFilter || deadlineFilter !== "ALL";

  const canEditTask = (task: Task) => canManage || task.assignedToId === userId;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{processed.length} tasks found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
              showFilters || hasActiveFilters
                ? "bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-violet-300"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-violet-600" />}
          </button>
          {canManage && (
            <button
              onClick={() => { setEditTask(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Search bar — always visible */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={search}
          onChange={e => { setSearch(e.target.value); resetPage(); }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        />
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); resetPage(); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="ALL">All Status</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value as any); resetPage(); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="ALL">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select value={projectFilter} onChange={e => { setProjectFilter(e.target.value); resetPage(); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select value={assigneeFilter} onChange={e => { setAssigneeFilter(e.target.value); resetPage(); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">All Members</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>

            <select value={deadlineFilter} onChange={e => { setDeadlineFilter(e.target.value as any); resetPage(); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="ALL">All Deadlines</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select value={sort} onChange={e => { setSort(e.target.value as SortKey); resetPage(); }}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="latest">Latest Created</option>
              <option value="updated">Recently Updated</option>
              <option value="priority">Highest Priority</option>
              <option value="deadline">Nearest Deadline</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs text-violet-600 hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Task List */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {hasActiveFilters ? "No tasks match your filters" : "No tasks yet"}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2 text-sm text-violet-600 hover:underline">Clear filters</button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map(task => {
              const pCfg = priorityConfig[task.priority];
              const sCfg = statusConfig[task.status];
              const over = task.dueDate ? isOverdue(task.dueDate) && task.status !== "COMPLETED" : false;

              return (
                <div key={task.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-sm transition-shadow group">
                  <div className="flex items-start gap-4">
                    {/* Quick status circle */}
                    <button
                      onClick={() => {
                        const next = task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "COMPLETED" : "TODO";
                        handleStatusChange(task, next);
                      }}
                      disabled={updatingId === task.id}
                      title="Click to advance status"
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        task.status === "COMPLETED"
                          ? "bg-green-500 border-green-500 text-white"
                          : task.status === "IN_PROGRESS"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-300 dark:border-gray-600 hover:border-violet-500"
                      )}
                    >
                      {task.status === "COMPLETED" && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => setDrawerTask(task)}
                            className={cn("font-medium text-left hover:text-violet-600 dark:hover:text-violet-400 transition-colors", task.status === "COMPLETED" ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white")}
                          >
                            {task.title}
                          </button>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                        </div>
                        {canEditTask(task) && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => { setEditTask(task); setModalOpen(true); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {canManage && (
                              <button
                                onClick={() => handleDelete(task.id, task.title)}
                                disabled={deletingId === task.id}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full", pCfg.class)}>{pCfg.label}</span>

                        {/* Status dropdown */}
                        <div className="relative group/status">
                          <button className={cn("flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full cursor-pointer", sCfg.class)}>
                            {sCfg.label} <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-10 hidden group-hover/status:block min-w-[130px]">
                            {statuses.map(s => (
                              <button key={s} onClick={() => handleStatusChange(task, s)}
                                className={cn("w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                                  task.status === s ? "text-violet-600 dark:text-violet-400" : "text-gray-700 dark:text-gray-300"
                                )}>
                                {s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                          {task.project.name}
                        </span>

                        {task.assignedTo && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <User className="w-3 h-3" />{task.assignedTo.name}
                          </span>
                        )}

                        {task.dueDate && (
                          <span className={cn("flex items-center gap-1 text-xs font-medium", over ? "text-red-500" : "text-gray-400 dark:text-gray-500")}>
                            <Calendar className="w-3 h-3" />
                            {over ? "Overdue · " : ""}{formatDate(task.dueDate)}
                          </span>
                        )}

                        <button
                          onClick={() => setDrawerTask(task)}
                          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-violet-500 transition-colors ml-auto"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {task._count.comments > 0 ? task._count.comments : ""}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={processed.length}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSuccess={refresh}
        task={editTask}
      />

      <TaskDrawer
        task={drawerTask}
        userId={userId}
        onClose={() => setDrawerTask(null)}
      />
    </div>
  );
}
