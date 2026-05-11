"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Sparkles, MessageSquareMore, User } from "lucide-react";

import UserInfo from "./UserInfo";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (path === "#") return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="w-full border-b font-sans sticky top-0 z-100 bg-white ">
      <div className="flex items-center justify-between h-17.5 px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Logo_Job_Connect_3-removebg-preview.png"
              alt="logo"
              width={110}
              height={40}
              className="object-contain"
            />
          </Link>

          <div className="flex items-center gap-6 text-black font-medium">
            <Link 
              href="/searching-page" 
              className={`font-semibold text-[16px] cursor-pointer transition-colors ${
                isActive("/searching-page") ? "text-[#1F84C5]" : "hover:text-[#1F84C5]"
              }`}
            >
              Việc làm ▾
            </Link>
            <p className="font-semibold text-[16px] cursor-pointer hover:text-[#1F84C5] transition-colors">
              Công cụ ▾
            </p>
            <p className="font-semibold text-[16px] cursor-pointer hover:text-[#1F84C5] transition-colors">
              Cẩm nang nghề nghiệp ▾
            </p>
            <Link 
              href="/cv"
              className={`font-semibold text-[16px] cursor-pointer transition-colors ${
                isActive("/cv") || isActive("/cv-builder") ? "text-[#1F84C5]" : "hover:text-[#1F84C5]"
              }`}
            >
              Tạo CV ▾
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/cv-builder/ai"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-[#00E5FF] text-white px-6 py-2 rounded-full font-bold text-[15px] shadow-sm hover:shadow-md transition-all hover:opacity-90"
          >
            <Sparkles className="w-4 h-4" /> Tạo CV bằng AI
          </Link>

          {!isAuthenticated ? (
            <div className="flex items-center gap-4">

              <Link
                className="bg-[#2c96c4] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-900 font-semibold"
                href="/auth/login"
              >
                Đăng nhập/Đăng Ký
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-[#fff] cursor-pointer hover:bg-gray-100">
                <Bell />
              </div>
              <div className="p-3 rounded-full bg-[#fff] cursor-pointer hover:bg-gray-100">
                <MessageSquareMore />
              </div>
              <div className="flex items-center gap-4">
                <UserInfo
                  avatarUserUrl={user?.avaUrl || ""}
                  nameUser={user?.lastName || user?.fullName || "User"}
                  stateUser={true}
                  idUser={String(user?.id || "N/A")}
                  emailUser={user?.email || ""}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
