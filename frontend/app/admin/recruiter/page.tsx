import { DashboardHeader } from "@/components/admin/dashboard-header";
import { StatsGrid } from "@/components/admin/recruiter/stats-grid";
import { TrendChart } from "@/components/admin/recruiter/trend-chart";
import { JobsTable } from "@/components/admin/recruiter/jobs-table";
import { Pagination } from "@/components/admin/recruiter/pagination";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Quản lý nhà tuyển dụng" />
      <StatsGrid />
      <TrendChart />
      <JobsTable />
      <Pagination />
    </div>
  );
}