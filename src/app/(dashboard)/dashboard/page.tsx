import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  FolderKanban, CheckSquare, Clock, AlertCircle, TrendingUp,
  Calendar, User, ArrowRight,
} from "lucide-react";
import { formatDate, getDaysUntil, isOverdue } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  TasksByPriorityChart,
  TaskStatusChart,
  ProjectProgressChart,
  TeamProductivityChart,
} from "@/components/dashboard/DashboardCharts";

const priorityColors = {
  HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#22c55e",
};
const statusColors = {
  TODO: "#6b7280", IN_PROGRESS: "#3b82f6", COMPLETED: "#10b981",
};
const projectStatusCls = {
  ACTIVE: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  COMPLETED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  ON_HOLD: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};
const priorityCls = {
  HIGH: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  MEDIUM: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  LOW: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 13);

  const [
    totalProjects, totalTasks, completedTasks,
    overdueTasks, recentActivity,
    allTasks, projects, members, activityLogs,
  ] = await Promise.all([
    db.project.count(),
    db.task.count(),
    db.task.count({ where: { status: "COMPLETED" } }),
    db.task.count({ where: { status: { not: "COMPLETED" }, dueDate: { lt: now } } }),
    db.activityLog.findMany({
      take: 8, orderBy: { timestamp: "desc" },
      include: { user: { select: { name: true } } },
    }),
    db.task.findMany({
      select: { priority: true, status: true, dueDate: true, createdAt: true, updatedAt: true },
    }),
    db.project.findMany({
      select: {
        id: true, name: true, status: true, deadline: true,
        tasks: { select: { status: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      take: 6, orderBy: { name: "asc" },
      select: {
        id: true, name: true, role: true,
        assignedTasks: { select: { status: true } },
      },
    }),
    db.activityLog.findMany({
      where: { timestamp: { gte: fourteenDaysAgo } },
      select: { timestamp: true, entityType: true, action: true },
    }),
  ]);

  const pendingTasks = totalTasks - completedTasks;

  // Charts data
  // const priorityData = [
  //   { name: "High", value: allTasks.filter(t => t.priority === "HIGH").length, color: priorityColors.HIGH },
  //   { name: "Medium", value: allTasks.filter(t => t.priority === "MEDIUM").length, color: priorityColors.MEDIUM },
  //   { name: "Low", value: allTasks.filter(t => t.priority === "LOW").length, color: priorityColors.LOW },
  // ];
  const priorityData = [
  { name: "High", value: allTasks.filter((t: { priority: string }) => t.priority === "HIGH").length, color: priorityColors.HIGH },
  { name: "Medium", value: allTasks.filter((t: { priority: string }) => t.priority === "MEDIUM").length, color: priorityColors.MEDIUM },
  { name: "Low", value: allTasks.filter((t: { priority: string }) => t.priority === "LOW").length, color: priorityColors.LOW }
];

  const statusData = [
    { name: "Todo", value: allTasks.filter(t => t.status === "TODO").length, color: statusColors.TODO },
    { name: "In Progress", value: allTasks.filter(t => t.status === "IN_PROGRESS").length, color: statusColors.IN_PROGRESS },
    { name: "Completed", value: allTasks.filter(t => t.status === "COMPLETED").length, color: statusColors.COMPLETED },
  ];

  const projectProgressData = projects.map(p => ({
    name: p.name,
    completed: p.tasks.filter(t => t.status === "COMPLETED").length,
    pending: p.tasks.filter(t => t.status !== "COMPLETED").length,
    total: p._count.tasks,
  }));

  // Trend: last 14 days
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayStart = new Date(d.setHours(0, 0, 0, 0));
    const dayEnd = new Date(d.setHours(23, 59, 59, 999));
    return {
      date: dateStr,
      completed: activityLogs.filter(l =>
        l.action.includes("marked as completed") &&
        new Date(l.timestamp) >= dayStart && new Date(l.timestamp) <= dayEnd
      ).length,
      created: activityLogs.filter(l =>
        l.entityType === "TASK" && l.action.includes("created") &&
        new Date(l.timestamp) >= dayStart && new Date(l.timestamp) <= dayEnd
      ).length,
    };
  });

  // High priority tasks
  const highPriorityTasks = await db.task.findMany({
    where: { priority: "HIGH", status: { not: "COMPLETED" } },
    take: 5, orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  // Upcoming deadlines
  const upcomingProjects = projects
    .filter(p => p.deadline && p.status !== "COMPLETED")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  const kpiStats = [
    { label: "Total Projects", value: totalProjects, icon: FolderKanban, cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" },
    { label: "Total Tasks", value: totalTasks, icon: CheckSquare, cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    { label: "Completed", value: completedTasks, icon: TrendingUp, cls: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
    { label: "Pending", value: pendingTasks, icon: Clock, cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
    { label: "Overdue", value: overdueTasks, icon: AlertCircle, cls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apos;s your project overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiStats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.cls)}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tasks by Priority</h2>
          <TasksByPriorityChart data={priorityData} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Task Status</h2>
          <TaskStatusChart data={statusData} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Project Progress</h2>
          <ProjectProgressChart data={projectProgressData} />
        </div>
      </div>

      {/* Team Productivity Line Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Trend (Last 14 days)</h2>
        <TeamProductivityChart data={trendData} />
      </div>

      {/* Activity + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <Link href="/activity" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{log.action}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {log.user.name} · {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
            <Link href="/projects" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingProjects.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No upcoming deadlines</p>
          ) : (
            <div className="space-y-3">
              {upcomingProjects.map(p => {
                const daysLeft = getDaysUntil(p.deadline!);
                const over = isOverdue(p.deadline!);
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{p._count.tasks} tasks</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", projectStatusCls[p.status])}>
                        {over ? "Overdue" : daysLeft === 0 ? "Today" : `${daysLeft}d`}
                      </span>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(p.deadline!)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* High Priority Tasks + Workload Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">High Priority Tasks</h2>
            <Link href="/tasks?priority=HIGH" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {highPriorityTasks.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No high priority tasks</p>
          ) : (
            <div className="space-y-3">
              {highPriorityTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{task.project.name}</span>
                      {task.assignedTo && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                          <User className="w-3 h-3" />{task.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", priorityCls.HIGH)}>High</span>
                    {task.dueDate && (
                      <span className={cn("flex items-center gap-1 text-xs", isOverdue(task.dueDate) ? "text-red-500" : "text-gray-400")}>
                        <Calendar className="w-3 h-3" />{getDaysUntil(task.dueDate)}d
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Member Workload Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Member Workload</h2>
            <Link href="/team" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No members yet</p>
          ) : (
            <div className="space-y-3">
              {members.map(m => {
                const total = m.assignedTasks.length;
                const done = m.assignedTasks.filter(t => t.status === "COMPLETED").length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={m.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                          {m.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{done}/{total} tasks</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
