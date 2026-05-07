import { DashboardHeader } from "@/components/admin/dashboard-header";
import { StatsGrid } from "@/components/admin/Jobs/stats-grid";
import { TrendChart } from "@/components/admin/Jobs/trend-chart";
import { JobsTable } from "@/components/admin/Jobs/jobs-table";
import { Pagination } from "@/components/admin/Jobs/pagination";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Quản lý Việc làm" />
      <StatsGrid />
      <TrendChart />
      <JobsTable />
      <Pagination />
    </div>
  );
}
