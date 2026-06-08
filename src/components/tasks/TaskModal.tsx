"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
});

type FormData = z.infer<typeof schema>;

interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assignedToId: string | null;
  dueDate: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
}

interface Project { id: string; name: string }
interface Member { id: string; name: string; email: string }

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
  defaultProjectId?: string;
}

export function TaskModal({ open, onClose, onSuccess, task, defaultProjectId }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const isEdit = !!task;

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM", status: "TODO" },
  });

  const selectedProjectId = watch("projectId");

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(d => setProjects(d.projects || []));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    fetch(`/api/projects/${selectedProjectId}`).then(r => r.json()).then(d => {
      const m = d.project?.members?.map((tm: any) => tm.user) || [];
      setMembers(m);
    });
  }, [selectedProjectId]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || "",
        projectId: task.projectId,
        assignedToId: task.assignedToId || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        priority: task.priority,
        status: task.status,
      });
    } else {
      reset({ title: "", description: "", projectId: defaultProjectId || "", assignedToId: "", dueDate: "", priority: "MEDIUM", status: "TODO" });
    }
  }, [task, defaultProjectId, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/tasks/${task!.id}` : "/api/tasks";
      const method = isEdit ? "PUT" : "POST";
      const body = {
        ...data,
        assignedToId: data.assignedToId || null,
        dueDate: data.dueDate || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }

      toast.success(isEdit ? "Task updated!" : "Task created!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Task Title *</label>
            <input
              {...register("title")}
              placeholder="e.g. Setup API endpoints"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="Task details..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project *</label>
            <select
              {...register("projectId")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            >
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.projectId && <p className="mt-1 text-sm text-red-500">{errors.projectId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign To</label>
            <select
              {...register("assignedToId")}
              disabled={!selectedProjectId}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition disabled:opacity-50"
            >
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {!selectedProjectId && <p className="mt-1 text-xs text-gray-400">Select a project first to see members</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
              <select
                {...register("priority")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select
                {...register("status")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition text-sm"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium transition">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
