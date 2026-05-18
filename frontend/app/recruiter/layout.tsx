import type { Metadata } from "next";

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
  return <>{children}</>;
}
