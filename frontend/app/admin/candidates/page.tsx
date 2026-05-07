"use client";

import { useState } from "react";
import { JobsTable } from "@/components/admin/candidates/jobs-table";
import { Pagination } from "@/components/admin/candidates/pagination";
import { StatsGrid } from "@/components/admin/candidates/stats-grid";
import { TrendChart } from "@/components/admin/candidates/trend-chart";
import { AddUserModal } from "@/components/admin/candidates/add-user-modal";

export default function AdminCandidates() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500 mt-1">Danh sách và quản lý tất cả người dùng trong hệ thống</p>
      </div>

      <StatsGrid />
      <TrendChart />
      <JobsTable onAddUser={() => setModalOpen(true)} />
      <Pagination />

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
