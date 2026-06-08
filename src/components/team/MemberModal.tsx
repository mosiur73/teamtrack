"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Plus, Trash2, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Member {
  user: User;
}

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  canManage: boolean;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  PROJECT_MANAGER: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  TEAM_MEMBER: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function MemberModal({ open, onClose, projectId, projectName, canManage }: MemberModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/projects/${projectId}`).then((r) => r.json()),
      fetch("/api/team").then((r) => r.json()),
    ]).then(([proj, team]) => {
      setMembers(proj.project?.members || []);
      setAllUsers(team.members || []);
      setLoading(false);
    });
  }, [open, projectId]);

  const memberIds = new Set(members.map((m) => m.user.id));

  const nonMembers = allUsers.filter(
    (u) => !memberIds.has(u.id) && u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (userId: string) => {
    setAddingId(userId);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      const user = allUsers.find((u) => u.id === userId)!;
      setMembers((prev) => [...prev, { user }]);
      toast.success(`${user.name} added to project`);
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this project?`)) return;
    setRemovingId(userId);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) { toast.error("Failed to remove member"); return; }
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      toast.success(`${name} removed from project`);
    } finally {
      setRemovingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{projectName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : (
            <>
              {/* Current Members */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Current Members ({members.length})
                </h3>
                {members.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                    No members yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {members.map(({ user }) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", roleColors[user.role] ?? "bg-gray-100 text-gray-600")}>
                              {user.role === "PROJECT_MANAGER" ? "PM" : user.role === "TEAM_MEMBER" ? "Member" : user.role}
                            </span>
                          </div>
                        </div>
                        {canManage && (
                          <button
                            onClick={() => handleRemove(user.id, user.name)}
                            disabled={removingId === user.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
                          >
                            {removingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Members */}
              {canManage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Members
                  </h3>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition mb-3 text-sm"
                  />
                  {nonMembers.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                      {search ? "No users match your search" : "All users are already members"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {nonMembers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAdd(user.id)}
                            disabled={addingId === user.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {addingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
