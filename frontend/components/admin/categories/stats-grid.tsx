"use client";

import { StatsCard } from "./stats-card";
import { mockCategoriesStats } from "@/lib/data/mock-data";
import { Layers, FileUser, PackagePlus, PackageX } from "lucide-react";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title={"Tổng số danh\mục"}
        value={mockCategoriesStats.total}
        icon={Layers}
        iconColorClass="text-yellow-500"
        iconBgClass="bg-yellow-50/50 border border-yellow-200"
      />
      <StatsCard
        title={"Danh mục\nhót\n(tháng này)"}
        value={mockCategoriesStats.hot}
        icon={FileUser}
        iconColorClass="text-emerald-500"
        iconBgClass="bg-emerald-50/50 border border-emerald-200"
      />
      <StatsCard
        title={"Danh mục\n mới\n(tháng này)"}
        value={mockCategoriesStats.new}
        icon={PackagePlus}
        iconColorClass="text-teal-500"
        iconBgClass="bg-teal-50/50 border border-teal-200"
      />
      <StatsCard
        title={"Danh mục \nhết hạn\n(tháng này)"}
        value={mockCategoriesStats.expired}
        icon={PackageX}
        iconColorClass="text-red-500"
        iconBgClass="bg-red-50/50 border border-red-200"
      />
    </div>
  );
}
