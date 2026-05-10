"use client";

import { useState } from "react";
import { StatsGrid } from "@/components/admin/users/stats-grid";
import { UsersTable } from "@/components/admin/users/users-table";
import { AddUserModal } from "@/components/admin/users/add-user-modal";

export default function AdminUsers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserAdded = () => {
    // Refresh the table by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách và quản lý tất cả người dùng trong hệ thống
        </p>
      </div>

      <StatsGrid />

      <UsersTable 
        key={refreshKey}
        onAddUser={() => setModalOpen(true)} 
      />

      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUserAdded}
      />
    </div>
  );
}
