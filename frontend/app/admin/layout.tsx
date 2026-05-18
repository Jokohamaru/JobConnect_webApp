import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị hệ thống",
  description:
    "Trang quản trị JobConnect - Quản lý người dùng, công ty, công việc và hệ thống",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
