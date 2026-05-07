import { DashboardHeader } from "@/components/admin/dashboard-header";
import { StatsGrid } from "@/components/admin/dashboard/stats-grid";
import { ActivityLog } from "@/components/admin/dashboard/activity-log";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Tổng Quan Bảng Điều Khiển" />
      <StatsGrid />
      <ActivityLog />
    </div>
  );
}
