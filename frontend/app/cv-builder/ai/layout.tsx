import type { Metadata } from "next";
import Navbar from "@/components/sections/menu/Navbar";

export const metadata: Metadata = {
  title: "Tạo CV với AI",
  description:
    "Tạo CV chuyên nghiệp với sự hỗ trợ của AI - Nhanh chóng, dễ dàng và hiệu quả",
};

export default function CVBuilderÁILayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
