import type { Metadata } from "next";
import { RecruiterNavbar } from "@/components/recruiter/RecruiterNavbar";

export const metadata: Metadata = {
  title: "Quản lý ứng viên – Job Connect",
  description: "Xem, đánh giá và quản lý tất cả ứng viên đã ứng tuyển vào tin đăng của bạn.",
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
