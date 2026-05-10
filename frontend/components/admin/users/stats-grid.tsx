"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { Users, UserPlus, Building, CheckCircle } from "lucide-react";

interface UsersStats {
  totalUsers: string;
  newCandidates: string;
  newRecruiters: string;
  activeUsers: string;
}

export function StatsGrid() {
  const [stats, setStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        const response = await fetch(`${apiUrl}/admin/users/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Failed to fetch users stats (${response.status})`
          );
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching users stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center text-red-500">
        Error loading users stats
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatsCard
        title={"Số tài khoản"}
        value={stats.totalUsers}
        icon={Users}
        iconColorClass="text-blue-500"
        iconBgClass="bg-blue-50 border border-blue-200"
      />
      <StatsCard
        title={"Số ứng viên\ntạo mới\n(tháng này)"}
        value={stats.newCandidates}
        icon={UserPlus}
        iconColorClass="text-green-500"
        iconBgClass="bg-green-50 border border-green-200"
      />
      <StatsCard
        title={"Số Recruiter\ntạo mới\n(tháng này)"}
        value={stats.newRecruiters}
        icon={Building}
        iconColorClass="text-purple-500"
        iconBgClass="bg-purple-50 border border-purple-200"
      />
      <StatsCard
        title={"Tài khoản\nhoạt động"}
        value={stats.activeUsers}
        icon={CheckCircle}
        iconColorClass="text-emerald-500"
        iconBgClass="bg-emerald-50 border border-emerald-200"
      />
    </div>
  );
}
