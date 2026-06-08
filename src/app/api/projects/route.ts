import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).default("ACTIVE"),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectsRaw = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
      tasks: { where: { status: "COMPLETED" }, select: { id: true } },
    },
  });

  const projects = projectsRaw.map(({ tasks, ...p }) => ({
    ...p,
    completedTaskCount: tasks.length,
  }));

  return NextResponse.json({ projects });
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

  const { name, description, deadline, status } = parsed.data;

  if (deadline && new Date(deadline) < new Date()) {
    return NextResponse.json({ error: "Please select a valid deadline (future date)" }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      name,
      description,
      deadline: deadline ? new Date(deadline) : null,
      status,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  const projectWithCount = { ...project, completedTaskCount: 0 };

  await db.activityLog.create({
    data: {
      action: `Project "${name}" created`,
      entityType: "PROJECT",
      entityName: name,
      userId: session.user.id,
      projectId: project.id,
    },
  });

  return NextResponse.json({ project: projectWithCount }, { status: 201 });
}
