import { JobsTable } from "@/components/admin/categories/jobs-table";
import { Pagination } from "@/components/admin/categories/pagination";
import { StatsGrid } from "@/components/admin/categories/stats-grid";
import { TrendChart } from "@/components/admin/categories/trend-chart";
import { DashboardHeader } from "@/components/admin/dashboard-header";


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
