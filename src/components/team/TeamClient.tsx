"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Briefcase, CheckSquare, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Workload {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  workload: Workload;
  projects: Project[];
}

const roleConfig: Record<string, { label: string; class: string }> = {
  ADMIN: { label: "Admin", class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  PROJECT_MANAGER: { label: "Project Manager", class: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  TEAM_MEMBER: { label: "Team Member", class: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = ["bg-violet-500", "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-pink-500", "bg-indigo-500"];
  return colors[name.charCodeAt(0) % colors.length];
}

function MemberCard({ member }: { member: Member }) {
  const [expanded, setExpanded] = useState(false);
  const { workload } = member;
  const completionRate = workload.total > 0 ? Math.round((workload.completed / workload.total) * 100) : 0;
  const roleCfg = roleConfig[member.role] ?? { label: member.role, class: "bg-gray-100 text-gray-600" };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
      {/* Top */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0", getAvatarColor(member.name))}>
          {getInitials(member.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
          <span className={cn("inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full", roleCfg.class)}>
            {roleCfg.label}
          </span>
        </div>
      </div>

      {/* Workload Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Total", value: workload.total, icon: CheckSquare, color: "text-gray-500 dark:text-gray-400" },
          { label: "Completed", value: workload.completed, icon: CheckSquare, color: "text-green-600 dark:text-green-400" },
          { label: "In Progress", value: workload.inProgress, icon: Clock, color: "text-blue-600 dark:text-blue-400" },
          { label: "Pending", value: workload.pending, icon: Clock, color: "text-amber-600 dark:text-amber-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
              <Icon className={cn("w-3.5 h-3.5 shrink-0", s.color)} />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue warning */}
      {workload.overdue > 0 && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-2 mb-4">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {workload.overdue} overdue task{workload.overdue > 1 ? "s" : ""}
        </div>
      )}

      {/* Progress bar */}
      {workload.total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Completion rate</span>
            <span className="font-medium text-gray-900 dark:text-white">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Projects */}
      {member.projects.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
          >
            <Briefcase className="w-3.5 h-3.5" />
            {member.projects.length} project{member.projects.length > 1 ? "s" : ""}
            {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1">
              {member.projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full ml-2 shrink-0",
                    p.status === "ACTIVE" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    p.status === "COMPLETED" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  )}>
                    {p.status === "ON_HOLD" ? "On Hold" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {member.projects.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> No projects assigned
        </p>
      )}
    </div>
  );
}

export function TeamClient({ members: initial }: { members: Member[] }) {
  const [members] = useState(initial);
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER">("ALL");

  const filtered = roleFilter === "ALL" ? members : members.filter((m) => m.role === roleFilter);

  const totalTasks = members.reduce((s, m) => s + m.workload.total, 0);
  const totalCompleted = members.reduce((s, m) => s + m.workload.completed, 0);
  const totalPending = members.reduce((s, m) => s + m.workload.pending, 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{members.length} members</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Members", value: members.length, icon: Users, color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" },
          { label: "Total Tasks", value: totalTasks, icon: CheckSquare, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
          { label: "Completed", value: totalCompleted, icon: CheckSquare, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
          { label: "Pending", value: totalPending, icon: Clock, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", "ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              roleFilter === r
                ? "bg-violet-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-300"
            )}
          >
            {r === "ALL" ? "All" : r === "PROJECT_MANAGER" ? "Project Manager" : r.charAt(0) + r.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Member Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}
