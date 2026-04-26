"use client";

import { cn } from "@/lib/utils";
import { LayoutGrid, Zap, Briefcase, Cpu, Star } from "lucide-react";

export type  FilterOption = "Tất cả" | "Đơn giản" | "Chuyên nghiệp" | "Hiện đại" | "ATS";

interface FilterBarProps {
  activeFilter: FilterOption;
  onChange: (filter: FilterOption) => void;
}

const FILTERS: { label: FilterOption; icon: React.ElementType }[] = [
  { label: "Tất cả", icon: LayoutGrid },
  { label: "ATS", icon: Zap },
  { label: "Đơn giản", icon: Star },
  { label: "Chuyên nghiệp", icon: Briefcase },
  { label: "Hiện đại", icon: Cpu },
];

export default function FilterBar({ activeFilter, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-8 px-6">
      {FILTERS.map(({ label, icon: Icon }) => {
        const isActive = activeFilter === label;
        return (
          <button
            key={label}
            onClick={() => onChange(label)}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
