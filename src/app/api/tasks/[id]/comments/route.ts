import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const comments = await db.comment.findMany({
    where: { taskId: id },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const task = await db.task.findUnique({ where: { id }, select: { title: true } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const comment = await db.comment.create({
    data: { content: parsed.data.content, taskId: id, userId: session.user.id },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  await db.activityLog.create({
    data: {
      action: `Commented on task "${task.title}"`,
      entityType: "TASK",
      entityName: task.title,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
