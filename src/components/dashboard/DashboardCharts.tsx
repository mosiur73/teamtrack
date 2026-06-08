"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
  TODO: "#6b7280",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#10b981",
};

const CHART_COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

interface PriorityData { name: string; value: number; color: string }
interface StatusData { name: string; value: number; color: string }
interface ProjectData { name: string; completed: number; total: number; pending: number }
interface TrendData { date: string; completed: number; created: number }

export function TasksByPriorityChart({ data }: { data: PriorityData[] }) {
  if (data.every(d => d.value === 0)) {
    return <EmptyChart message="No tasks yet" />;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: "12px", fontSize: "12px" }}
          formatter={(v) => [v, ""]}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TaskStatusChart({ data }: { data: StatusData[] }) {
  if (data.every(d => d.value === 0)) {
    return <EmptyChart message="No tasks yet" />;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: "12px", fontSize: "12px" }}
          formatter={(v) => [v, ""]}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ProjectProgressChart({ data }: { data: ProjectData[] }) {
  if (data.length === 0) {
    return <EmptyChart message="No projects yet" />;
  }
  const display = data.slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={display} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false}
          tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + "…" : v} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: "12px", fontSize: "12px" }}
          cursor={{ fill: "rgba(124,58,237,0.05)" }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
        <Bar dataKey="completed" name="Completed" fill="#7c3aed" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pending" name="Pending" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TeamProductivityChart({ data }: { data: TrendData[] }) {
  if (data.length === 0) {
    return <EmptyChart message="No activity data yet" />;
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "var(--tooltip-bg)", border: "1px solid var(--tooltip-border)", borderRadius: "12px", fontSize: "12px" }}
          cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
        <Line type="monotone" dataKey="completed" name="Completed" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: "#7c3aed" }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="created" name="Created" stroke="#e5e7eb" strokeWidth={2} dot={{ r: 3, fill: "#e5e7eb" }} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[220px] text-sm text-gray-400 dark:text-gray-500">
      {message}
    </div>
  );
}
