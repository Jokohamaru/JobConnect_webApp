"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { StatsGrid } from "@/components/admin/jobs/stats-grid-new";
import { JobsTable } from "@/components/admin/jobs/jobs-table-new";
import { AddJobModal } from "@/components/admin/jobs/add-job-modal";

export default function AdminJobs() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Quản lý Việc làm" />
      <StatsGrid key={`stats-${refreshKey}`} />
      <JobsTable 
        key={`table-${refreshKey}`}
        onAddJob={() => setIsAddModalOpen(true)} 
      />
      
      <AddJobModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
