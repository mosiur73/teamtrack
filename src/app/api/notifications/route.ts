import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
