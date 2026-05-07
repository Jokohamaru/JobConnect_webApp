"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-blue-600",
  iconBgClass = "bg-blue-50 border border-blue-200",
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
      {/* Icon */}
      <div className={cn("p-3 rounded-xl shrink-0", iconBgClass)}>
        <Icon className={cn("h-6 w-6", iconColorClass)} />
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <p
          className="text-xs font-medium text-gray-500 leading-tight whitespace-pre-line"
          style={{ whiteSpace: "pre-line" }}
        >
          {title}
        </p>
        <h2 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">
          {value}
        </h2>
      </div>
    </div>
  );
}
