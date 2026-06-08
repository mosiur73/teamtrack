import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await db.task.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, description, assignedToId, dueDate, priority, status } = parsed.data;

  // Prevent reassigning completed tasks
  if (existing.status === "COMPLETED" && assignedToId !== undefined && assignedToId !== existing.assignedToId) {
    return NextResponse.json({ error: "Completed tasks cannot be reassigned." }, { status: 400 });
  }

  // Prevent past due date
  if (dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
    return NextResponse.json({ error: "Please select a valid deadline (future date)" }, { status: 400 });
  }

  // Prevent duplicate title in same project (if title changed)
  if (title && title !== existing.title) {
    const duplicate = await db.task.findFirst({
      where: { title, projectId: existing.projectId, id: { not: id } },
    });
    if (duplicate) {
      return NextResponse.json({ error: "This task already exists in the project." }, { status: 409 });
    }
  }

  const task = await db.task.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(priority && { priority }),
      ...(status && { status }),
    },
    include: {
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  if (status && status !== existing.status) {
    await db.activityLog.create({
      data: {
        action: `Task "${task.title}" marked as ${status.replace("_", " ").toLowerCase()}`,
        entityType: "TASK",
        entityName: task.title,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    });
  }

  return NextResponse.json({ task });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { id } = await params;
  const task = await db.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  await db.task.delete({ where: { id } });

  await db.activityLog.create({
    data: {
      action: `Task "${task.title}" deleted`,
      entityType: "TASK",
      entityName: task.title,
      userId: session.user.id,
      projectId: task.projectId,
    },
  });

  return NextResponse.json({ success: true });
}
