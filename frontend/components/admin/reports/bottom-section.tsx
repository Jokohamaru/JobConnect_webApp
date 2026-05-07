"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { mockIndustryData, mockTopRecruiters } from "@/lib/data/mock-reports";

const RADIAN = Math.PI / 180;

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const renderCustomLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.07) return null;
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const rankBgColors = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

export function ReportBottomSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Pie Chart */}
      <Card className="shadow-sm border-none">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-800">
            Phân bố ngành nghề
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockIndustryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={115}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {mockIndustryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${String(value ?? "")}%`,
                    "Tỷ lệ",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom 2-column legend — outside fixed-height div */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 px-1">
            {mockIndustryData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[11px] text-gray-600 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Recruiters Table */}
      <Card className="shadow-sm border-none">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-800">
            Top Nhà Tuyển dụng tích cực
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-[56px_1fr_auto] gap-3 px-5 py-3 bg-gray-50/80 text-xs font-semibold text-gray-500 border-b border-gray-100">
            <span>Xếp hạng</span>
            <span>Công ty</span>
            <span>Số lượng việc làm</span>
          </div>

          {/* Table Rows */}
          {mockTopRecruiters.map((recruiter) => (
            <div
              key={recruiter.rank}
              className="grid grid-cols-[56px_1fr_auto] gap-3 px-5 py-3.5 items-center border-b border-gray-100 last:border-0 hover:bg-blue-50/40 transition-colors"
            >
              <div className="flex items-center justify-center">
                <span
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    backgroundColor:
                      rankBgColors[recruiter.rank - 1] ?? "#9ca3af",
                  }}
                >
                  {recruiter.rank}
                </span>
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {recruiter.company}
              </span>
              <span className="text-sm text-gray-600 font-semibold tabular-nums">
                {recruiter.jobCount}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
