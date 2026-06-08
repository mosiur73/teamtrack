import { ActivityClient } from "@/components/activity/ActivityClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activity Log — TeamTrack" };

export default function ActivityPage() {
  return <ActivityClient />;
}
