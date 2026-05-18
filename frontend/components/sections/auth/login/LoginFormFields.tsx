"use client";

import { useState, useTransition } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth-service";

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
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({}); // Clear previous errors
    setLoading(true);

    try {
      // Call API login
      const response = await authService.login({ email, password });

      // Save token
      login(response.access_token);

      // Save or remove email based on remember me option
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      // Get user role from token
      const role = authService.getUserRole() || "CANDIDATE";

      // Get redirect parameter from URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');

      // Redirect based on role or redirect parameter
      startTransition(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else if (role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (role === "RECRUITER") {
          router.push("/recruiter/dashboard");
        } else {
          router.push("/");
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific error messages
      let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      
      if (error.message.includes("Thông tin tài khoản không chính xác")) {
        errorMessage = "Email hoặc mật khẩu không đúng";
      } else if (error.message.includes("Network")) {
        errorMessage = "Lỗi kết nối. Vui lòng kiểm tra internet";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ root: errorMessage });
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
