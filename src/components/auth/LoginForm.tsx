"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const demoUsers = [
  { label: "Admin", email: "admin@demo.com", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-800" },
  { label: "Project Manager", email: "pm@demo.com", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" },
  { label: "Team Member", email: "member@demo.com", color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800" },
];

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    setValue("email", email);
    setValue("password", "demo@1234");
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">TeamTrack</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
      </div>

      {/* Demo login buttons */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Demo Login</p>
        <div className="grid grid-cols-3 gap-2">
          {demoUsers.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => handleDemoLogin(u.email)}
              className={`text-xs font-medium py-2 px-3 rounded-lg border transition-colors ${u.color}`}
            >
              {u.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">Password: demo@1234</p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white dark:bg-gray-950 text-gray-400">or sign in manually</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-violet-600 hover:text-violet-700 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
