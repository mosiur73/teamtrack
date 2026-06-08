"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Users, Activity, LogOut, ClipboardList, Settings,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/team", label: "Team", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const avatarColors = ["bg-violet-500", "bg-blue-500", "bg-green-500", "bg-amber-500", "bg-pink-500"];
function getAvatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-30">
      {/* Logo + Notification */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">TeamTrack</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-violet-600 dark:text-violet-400" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme + User + Sign out */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Theme</span>
          <ThemeToggle />
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0", getAvatarColor(user.name ?? "U"))}>
            {getInitials(user.name ?? "U")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              {user.role?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
