

import { Footer } from "@/components/sections/menu/Footer";
import Navbar from "@/components/sections/menu/Navbar";
import TopBanner from "@/components/sections/menu/TopBanner";
import AccessDenied from "@/components/ui/AccessDenied";


export default function Root({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-sans">
      <AccessDenied />
      <TopBanner />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
