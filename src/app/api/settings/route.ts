import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  if (type === "profile") {
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  }

  if (type === "password") {
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({ where: { id: session.user.id }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
}
