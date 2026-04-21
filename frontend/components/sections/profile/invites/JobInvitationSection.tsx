"use client";

import { useState } from "react";
import { Briefcase, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabKey = "pending" | "accepted" | "expired";

interface JobInvitation {
  id: string;
  company: string;
  position: string;
  status: TabKey;
}

const INVITATIONS: JobInvitation[] = [];

const TABS: { key: TabKey; label: string; emptyText: string }[] = [
  { key: "pending",  label: "Đang chờ",       emptyText: "Bạn có 0 Lời mời đang chờ" },
  { key: "accepted", label: "Đã chấp nhận",   emptyText: "Bạn có 0 Lời mời đã chấp nhận" },
  { key: "expired",  label: "Đã hết hạn",     emptyText: "Bạn có 0 Lời mời đã hết hạn" },
];

export function JobInvitationSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const getCount = (key: TabKey) =>
    INVITATIONS.filter((i) => i.status === key).length;

  const filtered= INVITATIONS.filter((i) => i.status === activeTab);
  const currentTab = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="px-4 flex flex-col gap-3">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-1">Lời mời công việc</h2>
        <p className="text-sm text-gray-500 mb-5">
          ITviec cung cấp dịch vụ kết nối ứng viên ẩn danh với các cơ hội việc làm phù hợp.
          Tìm hiểu thêm về Lời mời công việc{" "}
          <a href="#" className="text-blue-500 hover:underline font-medium">tại đây</a>.
        </p>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-gray-200">
          {TABS.map((tab) => {
            const count = getCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <div
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer flex items-center gap-2 pb-3 -mb-px border-b-2 transition
                  ${isActive
                    ? "border-blue-500 text-blue-500 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-5 text-center
                  ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* NOTICE */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Info className="w-4 h-4 shrink-0" />
        <p>Mục này lưu trữ lời mời còn hiệu lực, bạn có thể xem chi tiết và chia sẻ CV.</p>
      </div>

      {/* LIST / EMPTY STATE */}
      <div className="bg-white rounded-2xl shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Briefcase className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 mb-4 text-center">{currentTab.emptyText}</p>
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
              <div key={inv.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{inv.position}</p>
                  <p className="text-xs text-gray-500">{inv.company}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}