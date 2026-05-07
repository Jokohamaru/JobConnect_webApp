"use client";

import { StatsCard } from "./stats-card";
import { mockDashboardStats } from "@/lib/data/mock-data";
import { Briefcase, Building, UserPlus, Calendar } from "lucide-react";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title={"Tổng số việc\nlàm"}
        value={mockDashboardStats.totalJobs}
        icon={Briefcase}
        iconColorClass="text-yellow-500"
        iconBgClass="bg-yellow-50/50 border border-yellow-200"
      />
      <StatsCard
        title={"Nhà tuyển dụng\nmới\n(tháng này)"}
        value={mockDashboardStats.newEmployers}
        icon={Building}
        iconColorClass="text-emerald-500"
        iconBgClass="bg-emerald-50/50 border border-emerald-200"
      />
      <StatsCard
        title={"Ứng viên mới\n(tháng này)"}
        value={mockDashboardStats.newCandidates}
        icon={UserPlus}
        iconColorClass="text-teal-500"
        iconBgClass="bg-teal-50/50 border border-teal-200"
      />
      <StatsCard
        title={"Tin hết hạn\n(tháng này)"}
        value={mockDashboardStats.expiredJobs}
        icon={Calendar}
        iconColorClass="text-red-500"
        iconBgClass="bg-red-50/50 border border-red-200"
      />
    </div>
  );
}
