"use client";

import { StatsCard } from "./stats-card";
import { mockCandidateStats } from "@/lib/data/mock-data";
import { UserPlus , Clock, UserStar, FileUser } from "lucide-react";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        title={"Duyệt ứng viên \nchờ"}
        value={mockCandidateStats.pending}
        icon={Clock}
        iconColorClass="text-yellow-500"
        iconBgClass="bg-yellow-50/50 border border-yellow-200"
      />
      <StatsCard
        title={"Ứng viên\nmới\n"}
        subtitle="(tháng này)"
        value={mockCandidateStats.new}
        icon={UserPlus}
        iconColorClass="text-emerald-500"
        iconBgClass="bg-emerald-50/50 border border-emerald-200"
      />
      <StatsCard
        title={"Profile nổi bật \n"}
        value={mockCandidateStats.star}
        icon={UserStar}
        subtitle="(đang đăng tuyển)"
        iconColorClass="text-teal-500"
        iconBgClass="bg-teal-50/50 border border-teal-200"
      />
      <StatsCard
        title={"Nộp CV mới\n"}
        value={mockCandidateStats.newCV}
        icon={FileUser}
        trend="down"
        subtitle="(tháng này)"
        iconColorClass="text-red-500"
        iconBgClass="bg-red-50/50 border border-red-200"
      />
    </div>
  );
}
