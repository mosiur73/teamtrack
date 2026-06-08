"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, FolderKanban, Calendar,
  Users, CheckSquare, Search, ArrowUpDown,
} from "lucide-react";
import { ProjectModal } from "./ProjectModal";
import { MemberModal } from "@/components/team/MemberModal";
import { Pagination } from "@/components/shared/Pagination";
import { formatDate, getDaysUntil, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; email: string };
  _count: { tasks: number; members: number };
  completedTaskCount: number;
}

const statusConfig = {
  ACTIVE: { label: "Active", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  COMPLETED: { label: "Completed", class: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  ON_HOLD: { label: "On Hold", class: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
};

type SortKey = "latest" | "deadline" | "name" | "updated";
const LIMIT = 9;

export function ProjectsClient({ projects: initial, canManage }: { projects: Project[]; canManage: boolean }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [memberModal, setMemberModal] = useState<{ projectId: string; projectName: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED" | "ON_HOLD">("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [page, setPage] = useState(1);

  const refresh = async () => {
    const res = await fetch("/api/projects");
    const json = await res.json();
    setProjects(json.projects);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This will also delete all tasks.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete"); return; }
      toast.success("Project deleted");
      setProjects(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const processed = useMemo(() => {
    let result = [...projects];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") result = result.filter(p => p.status === statusFilter);

    // Sort
    result.sort((a, b) => {
      if (sort === "latest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0;
    });

    return result;
  }, [projects, search, statusFilter, sort]);

  const totalPages = Math.ceil(processed.length / LIMIT);
  const paginated = processed.slice((page - 1) * LIMIT, page * LIMIT);

  // Reset page on filter/search change
  const resetPage = () => setPage(1);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{processed.length} projects found</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setEditProject(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Search + Filters + Sort */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as any); resetPage(); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => { setSort(e.target.value as SortKey); resetPage(); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        >
          <option value="latest">Latest Created</option>
          <option value="updated">Recently Updated</option>
          <option value="deadline">Nearest Deadline</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {/* Project Cards */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {search || statusFilter !== "ALL" ? "No projects match your filters" : "No projects yet"}
          </p>
          {canManage && !search && statusFilter === "ALL" && (
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first project to get started</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginated.map(project => {
              const cfg = statusConfig[project.status];
              const overdue = project.deadline && isOverdue(project.deadline);
              const daysLeft = project.deadline ? getDaysUntil(project.deadline) : null;

              return (
                <div key={project.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", cfg.class)}>{cfg.label}</span>
                    {canManage && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setMemberModal({ projectId: project.id, projectName: project.name })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          title="Manage Members"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setEditProject(project); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          disabled={deletingId === project.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{project.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {project.description || "No description"}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />{project._count.tasks} tasks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />{project._count.members} members
                    </span>
                  </div>

                  {/* Progress bar */}
                  {project._count.tasks > 0 && (() => {
                    const pct = Math.round((project.completedTaskCount / project._count.tasks) * 100);
                    return (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-400 dark:text-gray-500">Progress</span>
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {project.completedTaskCount} of {project._count.tasks} completed
                        </p>
                      </div>
                    );
                  })()}

                  {project.deadline && (
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs font-medium mb-3",
                      overdue ? "text-red-500" : daysLeft !== null && daysLeft <= 3 ? "text-amber-500" : "text-gray-400 dark:text-gray-500"
                    )}>
                      <Calendar className="w-3.5 h-3.5" />
                      {overdue
                        ? `Overdue · ${formatDate(project.deadline)}`
                        : daysLeft === 0 ? "Due today"
                        : `${daysLeft}d left · ${formatDate(project.deadline)}`}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">by {project.createdBy.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(project.createdAt)}</span>
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

      <ProjectModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditProject(null); }}
        onSuccess={refresh}
        project={editProject}
      />

      {memberModal && (
        <MemberModal
          open={!!memberModal}
          onClose={() => setMemberModal(null)}
          projectId={memberModal.projectId}
          projectName={memberModal.projectName}
          canManage={canManage}
        />
      )}
    </div>
  );
}
