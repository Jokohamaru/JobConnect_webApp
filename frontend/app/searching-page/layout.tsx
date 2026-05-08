import { Footer } from "@/components/sections/menu/Footer";
import Navbar from "@/components/sections/menu/Navbar";
import TopBanner from "@/components/sections/menu/TopBanner";

export const metadata = {
  title: "Tìm kiếm việc làm | JobConnect",
  description: "Tìm kiếm hàng ngàn việc làm theo tên vị trí hoặc tên công ty tại JobConnect",
};

export default function SearchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="font-sans">
      <TopBanner />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
