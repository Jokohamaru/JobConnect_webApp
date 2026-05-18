import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Công ty",
  description:
    "Khám phá các công ty hàng đầu và cơ hội nghề nghiệp tại JobConnect",
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
