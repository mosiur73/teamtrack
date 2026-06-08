import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
  const type = searchParams.get("type") || undefined;
  const search = searchParams.get("search") || undefined;
  const range = searchParams.get("range") || "ALL";

  const now = new Date();
  let dateFilter: Date | undefined;
  if (range === "TODAY") { dateFilter = new Date(now.setHours(0, 0, 0, 0)); }
  else if (range === "WEEK") { const d = new Date(); d.setDate(d.getDate() - 7); dateFilter = d; }
  else if (range === "MONTH") { const d = new Date(); d.setDate(d.getDate() - 30); dateFilter = d; }

  const where = {
    ...(type && { entityType: type }),
    ...(search && { action: { contains: search, mode: "insensitive" as const } }),
    ...(dateFilter && { timestamp: { gte: dateFilter } }),
  };

  const [logs, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    }),
    db.activityLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
}
