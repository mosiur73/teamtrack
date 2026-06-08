import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) redirect("/login");

  return <SettingsClient user={JSON.parse(JSON.stringify(user))} />;
}
