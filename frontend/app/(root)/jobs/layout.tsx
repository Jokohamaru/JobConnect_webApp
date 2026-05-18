import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm việc làm",
  description:
    "Tìm kiếm và khám phá hàng ngàn cơ hội việc làm phù hợp với kỹ năng của bạn",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
