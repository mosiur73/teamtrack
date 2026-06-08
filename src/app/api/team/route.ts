import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const members = users.map((u) => {
    const total = u.assignedTasks.length;
    const completed = u.assignedTasks.filter((t) => t.status === "COMPLETED").length;
    const inProgress = u.assignedTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const pending = u.assignedTasks.filter((t) => t.status === "TODO").length;
    const overdue = u.assignedTasks.filter(
      (t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
      workload: { total, completed, inProgress, pending, overdue },
      projects: u.teamMemberships.map((m) => m.project),
    };
  });

  return NextResponse.json({ members });
}
