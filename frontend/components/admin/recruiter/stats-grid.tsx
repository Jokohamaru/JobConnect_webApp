"use client";

import { StatsCard } from "./stats-card";
import {  mockRecruiterStats } from "@/lib/data/mock-data";
import { Building2, Clock, CheckCircle2, XCircle } from "lucide-react";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title="Tổng số nhà tuyển dụng"
        value={mockRecruiterStats.total}
        icon={Building2}
        subtitle="+12% so với tháng trước"
        trend="up"
        iconColorClass="text-blue-600"
        iconBgClass="bg-blue-50"
      />
      <StatsCard
        title="Mới tháng này"
        value={mockRecruiterStats.new}
        icon={Clock}
        subtitle="Cần xử lý ngay"
        trend="neutral"
        iconColorClass="text-yellow-600"
        iconBgClass="bg-yellow-50"
      />
      <StatsCard
        title="Đang hoạt động"
        value={mockRecruiterStats.active}
        icon={CheckCircle2}
        subtitle="Đang đăng tuyển"
        trend="up"
        iconColorClass="text-emerald-600"
        iconBgClass="bg-emerald-50"
      />
      <StatsCard
        title="Hết hạn"
        value={mockRecruiterStats.expired }
        icon={XCircle}
        subtitle="Cần xử lý ngay"
        trend="down"
        iconColorClass="text-gray-600"
        iconBgClass="bg-gray-100"
      />
    </div>
  );
}
