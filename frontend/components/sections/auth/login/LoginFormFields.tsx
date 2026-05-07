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
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("remembered_email") ?? "";
    return "";
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== "undefined") return !!localStorage.getItem("remembered_email");
    return false;
  });
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
    
    setErrors({}); // Clear previous errors
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token);

        // Lưu hoặc xoá email theo tuỳ chọn nhớ mật khẩu
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        // Giải mã token để lấy role và redirect đúng trang
        let role = "CANDIDATE";
        try {
          const base64Url = data.access_token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(
            decodeURIComponent(
              window
                .atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            )
          );
          role = payload.role ?? "CANDIDATE";
        } catch (_) {
          // fallback
        }

        startTransition(() => {
          if (role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
            router.push("/");
          }
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      console.error(error);
      setErrors({ root: error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại." });
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

      <div className="flex items-center justify-between -mt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-[#0E7BC3] cursor-pointer"
          />
          <span className="text-sm text-gray-600">Nhớ mật khẩu</span>
        </label>
        <Link
          href="/auth/forgot-password"
          className="text-[#E94133] text-sm hover:underline font-medium"
        >
          Quên mật khẩu?
        </Link>
      </div>
      {/* Error Message */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
          {errors.root}
        </div>
      )}

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
