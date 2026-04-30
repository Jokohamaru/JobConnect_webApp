"use client";

import { useState, useTransition } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function LoginFormFields() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token);
        startTransition(() => {
          router.push("/");
        });
      } else {
        throw new Error("Đăng nhập thất bại");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      {/* Email Field */}
      <div className="w-full relative pb-6">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#49B0FD]" />
          <Input
            autoComplete="off"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-6 py-5 pl-12 border font-semibold border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm absolute bottom-0 left-1">{errors.email}</p>}
      </div>

      <div className="flex justify-end -mt-5">
          <Link
            href="/auth/forgot-password"
            className="text-[#E94133] text-sm hover:underline font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>
      {/* Password Field */}
      <div className="w-full relative pb-6">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#49B0FD]" />
          <Input
            autoComplete="new-password"
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-6 py-5 pl-12 border font-semibold border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent p-0 h-auto"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </Button>
        </div>
        {errors.password && <p className="text-red-500 text-sm absolute bottom-0 left-1">{errors.password}</p>}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || isPending}
        className="w-full bg-[#0E7BC3] text-white px-6 py-5 rounded-lg font-medium hover:bg-blue-500 cursor-pointer mt-4"
      >
        {loading || isPending ? "Đang xử lý..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
