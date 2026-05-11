"use client";

import { useState } from "react";
import { StatsGrid } from "@/components/admin/companies/stats-grid";
import { CompaniesTable } from "@/components/admin/companies/companies-table";
import { AddCompanyModal } from "@/components/admin/companies/add-company-modal";

export default function AdminCompanies() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompanyAdded = () => {
    // Refresh the table by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý công ty</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách và quản lý tất cả công ty trong hệ thống
        </p>
      </div>

      <StatsGrid />

      <CompaniesTable 
        key={refreshKey}
        onAddCompany={() => setModalOpen(true)} 
      />

      <AddCompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleCompanyAdded}
      />
    </div>
  );
}