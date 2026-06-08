import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ProjectsClient } from "@/components/projects/ProjectsClient";

export default async function ProjectsPage() {
  const session = await auth();

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

  const canManage = session?.user.role === "ADMIN" || session?.user.role === "PROJECT_MANAGER";

  return (
    <ProjectsClient
      projects={JSON.parse(JSON.stringify(projects))}
      canManage={canManage}
    />
  );
}
