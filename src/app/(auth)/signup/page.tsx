import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — TeamTrack",
};

export default function SignupPage() {
  return <SignupForm />;
}
