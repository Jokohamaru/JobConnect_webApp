"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginFormFields() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Đăng nhập thành công:", data);
        // TODO: Xử lý sau khi đăng nhập thành công (lưu token, chuyển hướng...)
        router.push("/");
      } else {
        console.log("Đăng nhập thất bại");
        // TODO: Hiển thị thông báo lỗi cho người dùng
      }
    } catch (error) {
      console.error("Lỗi khi gửi request:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <div className="relative">
          <Mail className="absolute  left-3 top-1/2 -translate-y-1/2  w-5 h-5 text-[#49B0FD]" />
          <Input
            autoComplete="off"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-5 pl-12 border font-semibold border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Link
          href="/auth/forgot-password"
          className="my-3 float-right text-[#E94133] hover:underline relative z-10"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <div className="relative ">
        <Lock className="absolute left-3 top-3/4 -translate-y-1/2 w-5 h-5 text-[#49B0FD]" />
        <Input
          autoComplete="new-password"
          type={showPassword ? "text" : "password"}
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-6 py-5 pl-12 border font-semibold border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3/4 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </Button>
      </div>
      <Button className="w-full bg-[#0E7BC3] text-white px-6 py-5 rounded-lg font-medium hover:bg-blue-500 cursor-pointer  my-10">
        Đăng nhập bằng Email
      </Button>
    </form>
  );
}
