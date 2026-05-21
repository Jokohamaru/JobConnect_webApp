import type { Metadata } from "next";
import { RecruiterNavbar } from "@/components/recruiter/RecruiterNavbar";

export const metadata: Metadata = {
  title: "Nhà tuyển dụng",
  description:
    "Trang quản lý dành cho nhà tuyển dụng - Đăng tin, quản lý ứng viên và công việc",
};

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f0f5fb] font-sans">
      <RecruiterNavbar />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
