import { Role, ProjectStatus, TaskStatus, Priority } from "@prisma/client";

export type { Role, ProjectStatus, TaskStatus, Priority };

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
}

export interface ProjectWithDetails {
  id: string;
  name: string;
  description: string | null;
  deadline: Date | null;
  status: ProjectStatus;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    tasks: number;
    members: number;
  };
}

export interface TaskWithDetails {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date | null;
  fileUrl: string | null;
  createdAt: Date;
  project: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string;
  };
  _count: {
    comments: number;
  };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface MemberWorkload {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}
