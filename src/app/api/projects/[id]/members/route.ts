import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { id: projectId } = await params;
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await db.teamMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (existing) return NextResponse.json({ error: "Member already in project" }, { status: 409 });

  await db.teamMember.create({ data: { projectId, userId } });

  await db.activityLog.create({
    data: {
      action: `${user.name} added to project "${project.name}"`,
      entityType: "TEAM",
      entityName: user.name,
      userId: session.user.id,
      projectId,
    },
  });

  await db.notification.create({
    data: {
      userId,
      message: `You have been added to project "${project.name}"`,
      link: `/projects`,
    },
  });

  return NextResponse.json({ success: true, member: { id: userId, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { id: projectId } = await params;
  const { userId } = await req.json();

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  await db.teamMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });

  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } });

  await db.activityLog.create({
    data: {
      action: `${user?.name} removed from project "${project.name}"`,
      entityType: "TEAM",
      entityName: user?.name ?? "",
      userId: session.user.id,
      projectId,
    },
  });

  return NextResponse.json({ success: true });
}
