import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập / Đăng ký",
  description:
    "Đăng nhập hoặc đăng ký tài khoản JobConnect để truy cập đầy đủ tính năng",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
