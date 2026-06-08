import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  deadline: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await db.project.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true, role: true } } },
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { tasks: true, members: true } },
    },
  });

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, description, deadline, status } = parsed.data;

  if (deadline && new Date(deadline) < new Date()) {
    return NextResponse.json({ error: "Please select a valid deadline (future date)" }, { status: 400 });
  }

  const project = await db.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(status && { status }),
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  await db.activityLog.create({
    data: {
      action: `Project "${project.name}" updated`,
      entityType: "PROJECT",
      entityName: project.name,
      userId: session.user.id,
      projectId: project.id,
    },
  });

  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { id } = await params;

  const project = await db.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  await db.activityLog.create({
    data: {
      action: `Project "${project.name}" deleted`,
      entityType: "PROJECT",
      entityName: project.name,
      userId: session.user.id,
    },
  });

  await db.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
