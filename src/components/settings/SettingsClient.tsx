"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { User, Lock, Palette, Shield, Loader2, Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(6, "Min. 6 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

interface SettingsClientProps {
  user: { id: string; name: string; email: string; role: string };
}

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  TEAM_MEMBER: "Team Member",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  PROJECT_MANAGER: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  TEAM_MEMBER: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onProfileSubmit = async (data: ProfileData) => {
    setProfileLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", ...data }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success("Profile updated!");
      router.refresh();
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", ...data }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success("Password changed!");
      passwordForm.reset();
    } finally {
      setPasswordLoading(false);
    }
  };

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Section title="Profile" icon={User}>
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <span className={cn("inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full", roleColors[user.role])}>
              {roleLabels[user.role] ?? user.role}
            </span>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input
              {...profileForm.register("name")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Email cannot be changed</p>
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {profileLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Section>

      {/* Role & Permissions */}
      <Section title="Role & Permissions" icon={Shield}>
        <div className="space-y-3">
          {[
            { role: "ADMIN", perms: ["Full system access", "Manage all projects & tasks", "Manage users & roles"] },
            { role: "PROJECT_MANAGER", perms: ["Create & manage projects", "Assign tasks to members", "View all team data"] },
            { role: "TEAM_MEMBER", perms: ["View assigned tasks", "Update task status", "Add comments"] },
          ].map(({ role, perms }) => (
            <div
              key={role}
              className={cn(
                "p-4 rounded-xl border-2 transition-colors",
                user.role === role
                  ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30"
                  : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-60"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", roleColors[role])}>
                  {roleLabels[role]}
                </span>
                {user.role === role && (
                  <span className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 font-medium">
                    <Check className="w-3.5 h-3.5" /> Your role
                  </span>
                )}
              </div>
              <ul className="space-y-1">
                {perms.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance" icon={Palette}>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose your preferred theme</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                theme === value
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                theme === value
                  ? "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-sm font-medium",
                theme === value ? "text-violet-700 dark:text-violet-300" : "text-gray-600 dark:text-gray-400"
              )}>
                {label}
              </span>
              {theme === value && (
                <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Lock}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {[
            { name: "currentPassword" as const, label: "Current Password", placeholder: "Enter current password" },
            { name: "newPassword" as const, label: "New Password", placeholder: "Min. 6 characters" },
            { name: "confirmPassword" as const, label: "Confirm New Password", placeholder: "Repeat new password" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input
                {...passwordForm.register(name)}
                type="password"
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
              />
              {passwordForm.formState.errors[name] && (
                <p className="mt-1 text-sm text-red-500">{passwordForm.formState.errors[name]?.message}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </Section>
    </div>
  );
}
