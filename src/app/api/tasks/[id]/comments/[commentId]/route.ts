import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;
  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
