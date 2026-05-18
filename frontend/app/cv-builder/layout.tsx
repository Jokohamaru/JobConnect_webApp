import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo CV",
  description:
    "Công cụ tạo CV chuyên nghiệp với AI - Tạo CV đẹp, nổi bật trong vài phút",
};

// Standalone layout cho CV Builder — KHÔNG có Navbar, Footer, TopBanner
export default function CVBuilderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
