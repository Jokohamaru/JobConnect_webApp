import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { MessageSquareMore } from "lucide-react";
import { User } from 'lucide-react';

import UserInfo from "./UserInfo";
export default function Navbar() {
  return (
    <div className="w-full border-b font-sans sticky top-0 z-50 bg-white ">
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
            <p className="font-semibold cursor-pointer hover:text-blue-600">
              Việc làm ▾
            </p>
            <p className="font-semibold cursor-pointer hover:text-blue-600">
              Công cụ ▾
            </p>
            <p className="font-semibold cursor-pointer hover:text-blue-600">
              Cẩm nang nghề nghiệp ▾
            </p>
            <p className="font-semibold cursor-pointer hover:text-blue-600">
              Tạo CV bằng AI ▾
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            className="bg-[#D2D2D2] text-blue-800 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-400 font-semibold"
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
          <div className="p-3 rounded-full bg-[#E5E5E5]">
            <Bell />
          </div>
          <div className="p-3 rounded-full bg-[#E5E5E5]">
            <MessageSquareMore />
          </div>
          <div>
            <UserInfo avatarUserUrl={""} nameUser={"Thịnh Zuy"} stateUser={false} idUser={"12345678"} emailUser={"thanh@gmail.com"} />
          </div>
        </div>
      </div>
    </div>
  );
}
