"use client";

import { StatsCard } from "./stats-card";
import { mockJobStats } from "@/lib/data/mock-data";
import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title="Tổng số việc làm"
        value={mockJobStats.total}
        icon={Briefcase}
        subtitle="+12% so với tháng trước"
        trend="up"
        iconColorClass="text-blue-600"
        iconBgClass="bg-blue-50"
      />
      <StatsCard
        title="Đang chờ duyệt"
        value={mockJobStats.pending}
        icon={Clock}
        subtitle="Cần xử lý ngay"
        trend="neutral"
        iconColorClass="text-yellow-600"
        iconBgClass="bg-yellow-50"
      />
      <StatsCard
        title="Đang hoạt động"
        value={mockJobStats.active}
        icon={CheckCircle2}
        subtitle="+5% so với tuần trước"
        trend="up"
        iconColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
      />
      <StatsCard
        title="Hết hạn"
        value={mockJobStats.expired}
        icon={XCircle}
        subtitle="-2% so với tháng trước"
        trend="down"
        iconColorClass="text-gray-600"
        iconBgClass="bg-gray-100"
      />
    </div>
  );
}
