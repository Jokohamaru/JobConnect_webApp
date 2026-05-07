import { DashboardHeader } from "@/components/admin/dashboard-header";
import { ReportStatsGrid } from "@/components/admin/reports/stats-grid";
import { TrendLineChart } from "@/components/admin/reports/trend-line-chart";
import { ReportBottomSection } from "@/components/admin/reports/bottom-section";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Báo Cáo & Thống Kê" />
      <ReportStatsGrid />
      <TrendLineChart />
      <ReportBottomSection />
    </div>
  );
}
