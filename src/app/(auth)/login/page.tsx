import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — TeamTrack",
};

export default function LoginPage() {
  return <LoginForm />;
}
