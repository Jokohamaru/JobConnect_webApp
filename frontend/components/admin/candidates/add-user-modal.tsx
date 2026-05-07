"use client";

import { useState } from "react";
import { X, User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER" | "ADMIN">("CANDIDATE");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  if (!open) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "Vui lòng nhập họ";
    if (!lastName.trim()) newErrors.lastName = "Vui lòng nhập tên";
    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email không hợp lệ";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (!confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // const newErrors = validate();
    // if (Object.keys(newErrors).length > 0) {
    //   setErrors(newErrors);
    //   return;
    // }
    // setErrors({});
    // setLoading(true);
    // try {
    //   const response = await fetch("http://localhost:8080/auth/register", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       email,
    //       password,
    //       full_name: `${firstName} ${lastName}`.trim(),
    //       role,
    //     }),
    //   });
    //   if (!response.ok) {
    //     const err = await response.json().catch(() => null);
    //     throw new Error(err?.message || "Thêm người dùng thất bại");
    //   }
    //   setSuccessMsg("Thêm người dùng thành công!");
    //   setTimeout(() => {
    //     setSuccessMsg("");
    //     handleReset();
    //     onSuccess?.();
    //     onClose();
    //   }, 1200);
    // } catch (error: any) {
    //   setErrors({ root: error.message || "Có lỗi xảy ra" });
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleReset = () => {
    setFirstName(""); setLastName(""); setEmail("");
    setPassword(""); setConfirmPassword("");
    setRole("CANDIDATE"); setErrors({}); setSuccessMsg("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0E7BC3] to-[#49B0FD] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Thêm người dùng</h2>
              <p className="text-blue-100 text-xs mt-0.5">Tạo tài khoản mới cho hệ thống</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Họ & Tên */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Họ</Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.firstName ? "text-red-400" : "text-blue-400"}`} />
                <Input
                  type="text"
                  placeholder="Nhập Họ"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`pl-10 py-5 text-sm border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${errors.firstName ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Tên</Label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.lastName ? "text-red-400" : "text-blue-400"}`} />
                <Input
                  type="text"
                  placeholder="Nhập Tên"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`pl-10 py-5 text-sm border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${errors.lastName ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</Label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.email ? "text-red-400" : "text-blue-400"}`} />
              <Input
                type="email"
                placeholder="Nhập địa chỉ email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 py-5 text-sm border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${errors.email ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Mật khẩu</Label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.password ? "text-red-400" : "text-blue-400"}`} />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-10 py-5 text-sm border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${errors.password ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.confirmPassword ? "text-red-400" : "text-blue-400"}`} />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 pr-10 py-5 text-sm border rounded-lg focus:ring-2 focus:border-transparent focus:outline-none ${errors.confirmPassword ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Vai trò</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["CANDIDATE", "RECRUITER", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border-2 transition-all ${
                    role === r
                      ? "border-[#0E7BC3] bg-blue-50 text-[#0E7BC3]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {r === "CANDIDATE" ? "🧑 Ứng viên" : r === "RECRUITER" ? "🏢 Nhà tuyển dụng" : "🔑 Admin"}
                </button>
              ))}
            </div>
          </div>

          {/* Root error */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {errors.root}
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm text-center font-medium">
              ✓ {successMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 py-5 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 py-5 bg-[#0E7BC3] hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Thêm người dùng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
