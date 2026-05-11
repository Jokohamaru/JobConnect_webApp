"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { Building, Building2, Globe, TrendingUp } from "lucide-react";

interface CompaniesStats {
  totalCompanies: string;
  newCompanies: string;
  activeCompanies: string;
  companiesWithWebsite: string;
}

export function StatsGrid() {
  const [stats, setStats] = useState<CompaniesStats>({
    totalCompanies: "0",
    newCompanies: "0",
    activeCompanies: "0",
    companiesWithWebsite: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        const response = await fetch(`${apiUrl}/admin/companies/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching companies stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Tổng số công ty"
        value={stats.totalCompanies}
        icon={Building}
        loading={loading}
      />
      <StatsCard
        title="Công ty mới (tháng này)"
        value={stats.newCompanies}
        icon={Building2}
        loading={loading}
      />
      <StatsCard
        title="Công ty đang tuyển"
        value={stats.activeCompanies}
        icon={TrendingUp}
        loading={loading}
      />
      <StatsCard
        title="Có website"
        value={stats.companiesWithWebsite}
        icon={Globe}
        loading={loading}
      />
    </div>
  );
}