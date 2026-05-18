import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mẫu CV",
  description: "Quản lý và tạo CV chuyên nghiệp của bạn",
};

export default function CVLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
