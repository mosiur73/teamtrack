import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TeamClient } from "@/components/team/TeamClient";

export default async function TeamPage() {
  await auth();

  const users = await db.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      assignedTasks: {
        select: { id: true, status: true, priority: true, dueDate: true },
      },
      teamMemberships: {
        select: {
          project: { select: { id: true, name: true, status: true } },
        },
      },
    },
  });

  const members = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    createdAt: u.createdAt,
    workload: {
      total: u.assignedTasks.length,
      completed: u.assignedTasks.filter((t) => t.status === "COMPLETED").length,
      inProgress: u.assignedTasks.filter((t) => t.status === "IN_PROGRESS").length,
      pending: u.assignedTasks.filter((t) => t.status === "TODO").length,
      overdue: u.assignedTasks.filter(
        (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date()
      ).length,
    },
    projects: u.teamMemberships.map((m) => m.project),
  }));

  return <TeamClient members={JSON.parse(JSON.stringify(members))} />;
}
