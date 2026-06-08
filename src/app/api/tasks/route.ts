import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  assignedToId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const assignedToId = searchParams.get("assignedToId") || undefined;

  const tasks = await db.task.findMany({
    where: {
      ...(projectId && { projectId }),
      ...(status && { status: status as any }),
      ...(priority && { priority: priority as any }),
      ...(assignedToId && { assignedToId }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, description, projectId, assignedToId, dueDate, priority, status } = parsed.data;

  // Prevent past due date
  if (dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
    return NextResponse.json({ error: "Please select a valid deadline (future date)" }, { status: 400 });
  }

  // Prevent duplicate title in same project
  const duplicate = await db.task.findFirst({ where: { title, projectId } });
  if (duplicate) {
    return NextResponse.json({ error: "This task already exists in the project." }, { status: 409 });
  }

  const task = await db.task.create({
    data: {
      title,
      description,
      projectId,
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      status,
      createdById: session.user.id,
    },
    include: {
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  await db.activityLog.create({
    data: {
      action: `Task "${title}" created in "${task.project.name}"`,
      entityType: "TASK",
      entityName: title,
      userId: session.user.id,
      projectId,
      taskId: task.id,
    },
  });

  if (assignedToId) {
    await db.notification.create({
      data: {
        userId: assignedToId,
        message: `You have been assigned task "${title}"`,
        link: `/tasks`,
      },
    });
    await db.activityLog.create({
      data: {
        action: `Task "${title}" assigned to member`,
        entityType: "TASK",
        entityName: title,
        userId: session.user.id,
        projectId,
        taskId: task.id,
      },
    });
  }

  return NextResponse.json({ task }, { status: 201 });
}
