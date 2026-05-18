import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
  description: "Quản lý thông tin cá nhân và hồ sơ ứng tuyển của bạn",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
