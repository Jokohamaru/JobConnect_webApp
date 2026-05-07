"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityEntry {
  id: number;
  admin: string;
  action: string;
  jobTitle?: string;
  jobTitleLink?: string;
  time: string;
}

const mockActivityLog: ActivityEntry[] = [
  {
    id: 1,
    admin: "Trịnh Zuy",
    action: "đã duyệt tin đăng",
    jobTitle: "Nhân Viên Kinh Doanh/Sales Executive/Tư Vấn Bán Hàng",
    time: "2026-5-1",
  },
  {
    id: 2,
    admin: "Nguyễn Phúc Thành",
    action: "đã xóa tin đăng",
    jobTitle: "Nhân Viên Kinh Doanh/Sales Executive/Tư Vấn Bán Hàng",
    time: "2026-5-1",
  },
  {
    id: 3,
    admin: "Nguyễn Xuân Kiên",
    action: "đã thêm danh mục mới là: Giáo dục",
    time: "2026-5-1",
  },
  {
    id: 4,
    admin: "Trịnh Zuy",
    action: "đã cập nhật thông tin nhà tuyển dụng",
    jobTitle: "FPT Software",
    time: "2026-5-2",
  },
  {
    id: 5,
    admin: "Nguyễn Phúc Thành",
    action: "đã duyệt tin đăng",
    jobTitle: "Lập Trình Viên Frontend React/NextJS",
    time: "2026-5-2",
  },
  {
    id: 6,
    admin: "Nguyễn Xuân Kiên",
    action: "đã vô hiệu hóa tài khoản nhà tuyển dụng",
    jobTitle: "Tech Solutions VN",
    time: "2026-5-3",
  },
];

export function ActivityLog() {
  return (
    <Card className="shadow-sm border border-gray-100 bg-white">
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="text-lg font-bold text-gray-800">
          Nhật Ký Hoạt Động
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 px-6 py-3 bg-gray-50/80 text-sm font-semibold text-gray-600 border-b border-gray-100">
          <span>Quản trị viên</span>
          <span>Hoạt động</span>
          <span className="text-right">Thời gian</span>
        </div>

        {/* Timeline Rows */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[calc(0px+24px+8px)] top-0 bottom-0 w-[2px] bg-blue-200 z-0" />

          {mockActivityLog.map((entry, index) => (
            <div
              key={entry.id}
              className={`grid grid-cols-[1fr_2fr_1fr] gap-4 px-6 py-4 items-start relative hover:bg-blue-50/40 transition-colors ${
                index !== mockActivityLog.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10" />

              {/* Admin name */}
              <span className="text-sm text-gray-700 pl-7 font-medium">
                {entry.admin}
              </span>

              {/* Action */}
              <span className="text-sm text-gray-600">
                {entry.action}{" "}
                {entry.jobTitle && (
                  <span className="text-blue-600 font-medium underline cursor-pointer hover:text-blue-800 transition-colors">
                    {entry.jobTitle}
                  </span>
                )}
              </span>

              {/* Time */}
              <span className="text-sm text-gray-500 text-right">
                {entry.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
