import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={{ name: session.user.name, email: session.user.email, role: session.user.role }} />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
