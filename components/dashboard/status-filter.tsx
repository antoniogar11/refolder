"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type StatusOption = {
  value: string;
  label: string;
};

type StatusFilterProps = {
  options: StatusOption[];
};

export function StatusFilter({ options }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "";

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === currentStatus) {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleClick(option.value)}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors border",
            currentStatus === option.value
              ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
