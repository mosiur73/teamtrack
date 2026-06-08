"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
      {[
        { value: "light", icon: Sun },
        { value: "system", icon: Monitor },
        { value: "dark", icon: Moon },
      ].map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            theme === value
              ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          )}
          title={value.charAt(0).toUpperCase() + value.slice(1)}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
