"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { Briefcase, Plus, CheckCircle, Clock } from "lucide-react";

interface JobsStats {
  totalJobs: string;
  newJobs: string;
  publishedJobs: string;
  pendingJobs: string;
}

export function StatsGrid() {
  const [stats, setStats] = useState<JobsStats>({
    totalJobs: "0",
    newJobs: "0",
    publishedJobs: "0",
    pendingJobs: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        
        const response = await fetch(`${apiUrl}/admin/jobs/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching jobs stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Tổng số việc làm"
        value={stats.totalJobs}
        icon={Briefcase}
        loading={loading}
      />
      <StatsCard
        title="Việc làm mới (tháng này)"
        value={stats.newJobs}
        icon={Plus}
        loading={loading}
      />
      <StatsCard
        title="Đang tuyển"
        value={stats.publishedJobs}
        icon={CheckCircle}
        loading={loading}
      />
      <StatsCard
        title="Chờ duyệt"
        value={stats.pendingJobs}
        icon={Clock}
        loading={loading}
      />
    </div>
  );
}
