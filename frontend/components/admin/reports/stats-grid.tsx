"use client";

import { ReportStatCard } from "./stat-card";
import { mockReportStats } from "@/lib/data/mock-reports";
import { TrendingUp, Eye, DollarSign, CheckCircle2 } from "lucide-react";

export function ReportStatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <ReportStatCard
        title="Tỷ lệ Ứng tuyển"
        value={mockReportStats.applicationRate}
        icon={TrendingUp}
        iconColorClass="text-blue-500"
        iconBgClass="bg-blue-50 border border-blue-200"
        subtitle="Tổng tỷ lệ ứng viên apply"
      />
      <ReportStatCard
        title="Lượt truy cập"
        value={mockReportStats.totalVisits}
        icon={Eye}
        iconColorClass="text-violet-500"
        iconBgClass="bg-violet-50 border border-violet-200"
        subtitle="Tháng này"
      />
      <ReportStatCard
        title="Doanh thu tháng này"
        value={mockReportStats.monthlyRevenue}
        icon={DollarSign}
        iconColorClass="text-emerald-500"
        iconBgClass="bg-emerald-50 border border-emerald-200"
        subtitle="Từ nhà tuyển dụng"
      />
      <ReportStatCard
        title="Tỷ lệ tin đăng thành công"
        value={mockReportStats.successRate}
        icon={CheckCircle2}
        iconColorClass="text-pink-500"
        iconBgClass="bg-pink-50 border border-pink-200"
        subtitle="Tin được duyệt"
      />
    </div>
  );
}
