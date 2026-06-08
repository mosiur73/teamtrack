"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]),
});

type FormData = z.infer<typeof schema>;

interface Project {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
}

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project | null;
}

export function ProjectModal({ open, onClose, onSuccess, project }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!project;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "ACTIVE" },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || "",
        deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
        status: project.status,
      });
    } else {
      reset({ name: "", description: "", deadline: "", status: "ACTIVE" });
    }
  }, [project, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/projects/${project!.id}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }

      toast.success(isEdit ? "Project updated!" : "Project created!");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit Project" : "New Project"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Name *</label>
            <input
              {...register("name")}
              placeholder="e.g. E-Commerce App"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Describe the project..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
              <input
                {...register("deadline")}
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select
                {...register("status")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
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
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
