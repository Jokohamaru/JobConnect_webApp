import { DashboardHeader } from "@/components/admin/dashboard-header";
import { StatsGrid } from "@/components/admin/dashboard/stats-grid";
import { TrendChart } from "@/components/admin/dashboard/trend-chart";
import { JobsTable } from "@/components/admin/dashboard/jobs-table";
import { Pagination } from "@/components/admin/dashboard/pagination";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Tổng Quan Bảng Điều Khiển" />
      <StatsGrid />
      <TrendChart />
      <JobsTable />
      <Pagination />
    </div>
  );
}
