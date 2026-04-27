"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { MessageSquareMore } from "lucide-react";
import { User } from "lucide-react";

import UserInfo from "./UserInfo";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <div className="w-full border-b font-sans sticky top-0 z-50 bg-linear-to-r from-[#9358f7] via-[#6197ee] to-[#10d7e2] ">
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

          <div className="flex items-center gap-6 text-blue-800 font-medium">
            <p className="font-semibold text-[16px] cursor-pointer hover:text-white">
              Việc làm ▾
            </p>
            <p className="font-semibold text-[16px] cursor-pointer hover:text-white">
              Công cụ ▾
            </p>
            <p className="font-semibold text-[16px] cursor-pointer hover:text-white">
              Cẩm nang nghề nghiệp ▾
            </p>
            <p className="font-semibold text-[16px] cursor-pointer hover:text-white">
              Tạo CV bằng AI ▾
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                className="bg-[#ffffff] text-blue-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 font-semibold"
                href=""
              >
                Đăng tuyển & tìm hồ sơ
              </Link>

              <Link
                className="bg-[#1F84C5] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-900 font-semibold"
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
                  avatarUserUrl={""}
                  nameUser={user?.fullName || "User"}
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
