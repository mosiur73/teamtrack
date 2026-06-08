import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TasksClient } from "@/components/tasks/TasksClient";

export default async function TasksPage() {
  const session = await auth();

  const tasks = await db.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { comments: true } },
    },
  });

  const canManage = session?.user.role === "ADMIN" || session?.user.role === "PROJECT_MANAGER";

  return (
    <TasksClient
      tasks={JSON.parse(JSON.stringify(tasks))}
      canManage={canManage}
      userId={session?.user.id ?? ""}
      userRole={session?.user.role ?? ""}
    />
  );
}
