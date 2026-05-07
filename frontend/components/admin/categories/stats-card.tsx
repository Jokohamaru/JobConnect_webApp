"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  iconColorClass?: string;
  iconBgClass?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  trend,
  iconColorClass = "text-blue-600",
  iconBgClass = "bg-blue-50"
}: StatsCardProps) {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-300 border-none shadow-sm rounded-xl overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <div className={cn("p-2.5 rounded-lg", iconBgClass)}>
            <Icon className={cn("h-5 w-5", iconColorClass)} />
          </div>
        </div>
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-black">{value}</h2>
          {subtitle && (
            <p className={cn(
              "text-xs font-medium mt-1",
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
