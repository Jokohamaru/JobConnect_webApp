"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, MessageSquare, ChevronDown, MessageSquareMore } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import UserInfo from "../sections/menu/UserInfo";

const navItems = [
  { label: "Bảng điều khiển", href: "/recruiter/dashboard" },
  { label: "Quản lý ứng viên", href: "/recruiter/candidates" },
  { label: "Đăng tin tuyển dụng", href: "/recruiter/post-job" },
  { label: "Báo cáo", href: "/recruiter/reports" },
];

export function RecruiterNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className=" mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/ " className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/Logo_Job_Connect_3-removebg-preview.png"
              alt="logo"
              width={110}
              height={40}
              className="object-contain"
            />
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600 rounded-none"
                      : "text-gray-600 hover:text-blue-600",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-[#fff] cursor-pointer hover:bg-gray-100">
            <Bell />
          </div>
          <div className="p-3 rounded-full bg-[#fff] cursor-pointer hover:bg-gray-100">
            <MessageSquareMore />
          </div>
          <UserInfo
            avatarUserUrl={user?.avaUrl || ""}
            nameUser={user?.fullName || "User"}
            stateUser={true}
            idUser={String(user?.id || "N/A")}
            emailUser={user?.email || ""}
          />
        </div>
      </div>
    </header>
  );
}
