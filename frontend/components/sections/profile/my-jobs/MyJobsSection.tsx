"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
type TabKey = "applied" | "saved" | "viewed";

interface MyJobs {
  id: string;
  nameJobs: string;
  position: string;
  company: string;
  status: TabKey;
}

const JOBS: MyJobs[] = [];
export default function MyJobsSection() {
  const [activeTab, setActiveTab] = useState("applied");

  const tabs = [
    {
      key: "applied",
      label: "Đã ứng tuyển",
      count: 0,
      emptyText: "Bạn chưa ứng tuyển vào công việc nào trong 12 tháng qua.",
    },
    {
      key: "saved",
      label: "Đã lưu",
      count: 0,
      emptyText: "Bạn chưa lưu công việc nào.",
    },
    {
      key: "viewed",
      label: "Đã xem gần đây",
      count: 0,
      emptyText: "Bạn chưa xem công việc nào",
    },
  ];
  const getCount = (key: TabKey) =>
    JOBS.filter((i) => i.status === key).length;

  const filtered = JOBS.filter((i) => i.status === activeTab);
  const currentTab = tabs.find((t) => t.key === activeTab)!;
  return (
    <div className="px-4 flex flex-col gap-3">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4 ">
          <h2 className="text-2xl font-semibold">Việc làm của tôi</h2>
          <p className="text-sm text-gray-500">
            Bạn có thể lưu tối đa 20 công việc.
          </p>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 pb-2">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`cursor-pointer flex items-center gap-2 pb-2 transition
              ${
                activeTab === tab.key
                  ? "text-blue-500 border-b-2 border-blue-500 font-medium"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full
                ${
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-500"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NOTICE */}
      <div className="flex items-center gap-2 text-sm text-gray-500 ">
        <span className="w-5 h-5 flex items-center justify-center rounded-full border text-xs">
          !
        </span>
        <p>
          Các công việc bạn đã ứng tuyển được lưu trữ trong 12 tháng gần đây.
        </p>
      </div>

      {/* EMPTY STATE */}
      <div className="bg-white rounded-2xl shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Briefcase className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 mb-4 text-center">
              {currentTab.emptyText}
            </p>
            <Button
              variant="outline"
              className="px-6 border-blue-400 text-blue-500 hover:bg-blue-500 hover:text-white transition"
            >
              Tìm việc ngay
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{inv.position}</p>
                  <p className="text-xs text-gray-500">{inv.nameJobs}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
