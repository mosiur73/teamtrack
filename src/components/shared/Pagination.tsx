"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  limit: number;
}

export function Pagination({ page, totalPages, onPageChange, total, limit }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
  );

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-900 dark:text-white">{from}–{to}</span> of{" "}
        <span className="font-medium text-gray-900 dark:text-white">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          const showDots = prev && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showDots && <span className="px-1 text-gray-400">…</span>}
              <button
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-9 h-9 rounded-xl text-sm font-medium transition-colors",
                  p === page
                    ? "bg-violet-600 text-white"
                    : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
