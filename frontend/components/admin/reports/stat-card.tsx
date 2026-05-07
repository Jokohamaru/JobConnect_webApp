"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ReportStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
  subtitle?: string;
}

export function ReportStatCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "text-blue-600",
  iconBgClass = "bg-blue-50 border border-blue-200",
  subtitle,
}: ReportStatCardProps) {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-none shadow-sm rounded-xl overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-2">
          <p className="text-sm font-medium text-muted-foreground leading-snug">
            {title}
          </p>
          <div className={cn("p-2.5 rounded-lg shrink-0", iconBgClass)}>
            <Icon className={cn("h-5 w-5", iconColorClass)} />
          </div>
        </div>
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-gray-900">{value}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
