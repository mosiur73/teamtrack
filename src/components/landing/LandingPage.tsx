"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard, CheckSquare, Users, Activity,
  BarChart3, Bell, Shield, Moon, ArrowRight,
  FolderKanban, MessageSquare, Zap, Check,
  ClipboardList, TrendingUp, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Scroll Reveal wrapper ─── */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}

/* ─── Data ─── */
const features = [
  { icon: FolderKanban, title: "Project Management", desc: "Create and manage projects with deadlines, statuses, and team members. Visual progress bar per project." },
  { icon: CheckSquare, title: "Task Management", desc: "Full CRUD tasks with priority, due date, and assignee. Inline status updates and smart validation rules." },
  { icon: MessageSquare, title: "Task Comments", desc: "Collaborate directly on tasks. Leave comments and view full task details in a smooth slide-over drawer." },
  { icon: BarChart3, title: "Dashboard Analytics", desc: "KPI cards, pie charts, bar charts, and a 14-day activity line chart. Real-time team productivity insights." },
  { icon: Users, title: "Team Collaboration", desc: "Assign tasks to members, view per-member workload stats, and manage project membership easily." },
  { icon: Activity, title: "Activity Log", desc: "Every action is logged — project updates, task changes, member additions. Searchable and filterable timeline." },
  { icon: Bell, title: "Notifications", desc: "In-app notification bell with unread badge. Auto-polling, mark as read, and delete notifications." },
  { icon: Shield, title: "Role-Based Access", desc: "Admin, Project Manager, Team Member — each with specific permissions enforced on frontend and API." },
  { icon: Moon, title: "Dark / Light Mode", desc: "Full dark and light theme support with system preference detection, persisted across sessions." },
];

const steps = [
  { icon: ClipboardList, step: "01", title: "Create your account", desc: "Sign up in seconds. Choose your role — Project Manager or Team Member — and jump straight in." },
  { icon: FolderKanban, step: "02", title: "Set up your project", desc: "Create a project, invite team members, and break the work into tasks with priorities and deadlines." },
  { icon: TrendingUp, step: "03", title: "Track & collaborate", desc: "Monitor progress on the dashboard, comment on tasks, get notifications, and never miss a deadline." },
];

const roles = [
  {
    role: "Admin",
    color: "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30",
    badge: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400",
    perms: ["Full system access", "Manage all projects & tasks", "Manage users & roles", "View all analytics", "Delete anything"],
  },
  {
    role: "Project Manager",
    color: "border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30",
    badge: "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400",
    perms: ["Create & manage projects", "Assign tasks to members", "Add / remove members", "View all team data", "Activity log access"],
  },
  {
    role: "Team Member",
    color: "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30",
    badge: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400",
    perms: ["View assigned tasks", "Update task status", "Add comments", "Receive notifications", "View dashboard"],
  },
];

const testimonials = [
  { name: "Sarah K.", role: "Product Manager", avatar: "SK", text: "TeamTrack completely changed how our team handles projects. The dashboard analytics give us insights we never had before.", stars: 5 },
  { name: "James R.", role: "Team Lead", avatar: "JR", text: "Setting up projects and assigning tasks is so smooth. The notification system keeps everyone in the loop without any extra effort.", stars: 5 },
  { name: "Mia T.", role: "Developer", avatar: "MT", text: "Love the dark mode and the task drawer. Being able to leave comments right on a task without leaving the page is a game changer.", stars: 5 },
];

/* ─── Main Component ─── */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">MolyLearn</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="anim-fade-up" style={{ animationDelay: "0ms" }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" /> Smart Project & Task Collaboration
            </span>
          </div>
          <h1 className="anim-fade-up text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6" style={{ animationDelay: "80ms" }}>
            Manage projects,
            <span className="text-violet-600"> track tasks,</span>
            <br />collaborate as a team.
          </h1>
          <p className="anim-fade-up text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animationDelay: "160ms" }}>
            MolyLearn brings your team together — assign tasks, monitor progress,
            get analytics, and never miss a deadline.
          </p>
          <div className="anim-fade-up flex items-center justify-center gap-4 flex-wrap" style={{ animationDelay: "240ms" }}>
            <Link href="/signup" className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-950">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "3", label: "User Roles" },
            { value: "80+", label: "Features" },
            { value: "4", label: "Chart Types" },
            { value: "100%", label: "TypeScript" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <p className="text-3xl font-extrabold text-violet-600">{s.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">How it works</span>
            <h2 className="text-3xl font-bold mt-2 mb-3">Up and running in minutes</h2>
            <p className="text-gray-500 dark:text-gray-400">Three simple steps to get your team collaborating</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200 dark:from-violet-900 dark:via-violet-600 dark:to-violet-900" />
            {steps.map(({ icon: Icon, step, title, desc }, i) => (
              <Reveal key={step} delay={i * 120} className="relative text-center">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-violet-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-200 dark:shadow-violet-950 relative z-10">
                    <Icon className="w-8 h-8 text-white" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-900 border-2 border-violet-600 rounded-full text-[10px] font-bold text-violet-600 flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Features</span>
            <h2 className="text-3xl font-bold mt-2 mb-3">Everything your team needs</h2>
            <p className="text-gray-500 dark:text-gray-400">All the tools to manage work from start to finish</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div className="h-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md hover:border-violet-100 dark:hover:border-violet-800 transition-all">
                  <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Showcase ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Roles</span>
            <h2 className="text-3xl font-bold mt-2 mb-3">The right access for everyone</h2>
            <p className="text-gray-500 dark:text-gray-400">Three roles with distinct permissions, enforced on both frontend and API</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(({ role, color, badge, perms }, i) => (
              <Reveal key={role} delay={i * 100}>
                <div className={cn("rounded-2xl border-2 p-6 h-full", color)}>
                  <span className={cn("inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5", badge)}>
                    {role}
                  </span>
                  <ul className="space-y-2.5">
                    {perms.map(p => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="w-4 h-4 text-violet-500 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl font-bold mt-2 mb-3">Teams love TeamTrack</h2>
            <p className="text-gray-500 dark:text-gray-400">Here what people are saying</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, text, stars }, i) => (
              <Reveal key={name} delay={i * 100}>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 mb-5">{text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Credentials ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Demo</span>
            <h2 className="text-3xl font-bold mt-2 mb-3">Try it instantly</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10">Use one of the demo accounts to explore the app right now</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { role: "Admin", email: "admin@demo.com", color: "bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900 text-red-600 dark:text-red-400", dot: "bg-red-500" },
              { role: "Project Manager", email: "pm@demo.com", color: "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
              { role: "Team Member", email: "member@demo.com", color: "bg-green-50 dark:bg-green-950/40 border-green-100 dark:border-green-900 text-green-600 dark:text-green-400", dot: "bg-green-500" },
            ].map((d, i) => (
              <Reveal key={d.role} delay={i * 80}>
                <div className={cn("border rounded-2xl p-5 text-left", d.color)}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-2 h-2 rounded-full", d.dot)} />
                    <span className="text-xs font-semibold uppercase tracking-wide">{d.role}</span>
                  </div>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mb-1">{d.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Password: demo@1234</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={240}>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Go to Login
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
        <Reveal className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">Start collaborating today</h2>
          <p className="text-white/75 text-lg mb-10">
            Create your account in seconds — no credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="flex items-center gap-2 px-7 py-3.5 bg-white text-violet-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="px-7 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:border-white/70 transition-colors">
              Sign in
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
              <FolderKanban className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">MolyLearn</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">© 2025 MolyLearn. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-gray-400 hover:text-violet-600 transition-colors">Sign in</Link>
            <Link href="/signup" className="text-xs text-gray-400 hover:text-violet-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
