"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Trash2, Pencil, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth-service";

function FloatingInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  disabled = false,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={`relative border border-gray-200 rounded-xl px-3 pt-5 pb-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white group ${disabled ? 'opacity-60' : ''}`}>
      <label className="absolute top-1.5 left-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide group-focus-within:text-blue-500 transition-colors">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full text-sm text-gray-800 outline-none bg-transparent placeholder-gray-300 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

export function ProfileEditDialog({ profile, setProfile, onProfileUpdate }: any) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { token: contextToken } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Fallback: nếu context chưa load xong thì đọc thẳng từ localStorage
  const getToken = () => contextToken || authService.getToken();

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const getAvatarSrc = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return url;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const token = getToken();
    if (!file || !token) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${API_URL}/user/profile/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, avatar: data.avaUrl || "" });
        onProfileUpdate?.();
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/profile/me/avatar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProfile({ ...profile, avatar: "" });
        onProfileUpdate?.();
      }
    } catch (err) {
      console.error("Avatar removal failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setIsSaving(true);
    try {
      // Tách firstName / lastName từ name
      const nameParts = (profile.name || "").trim().split(/\s+/);
      const lastName = nameParts.pop() || "";
      const firstName = nameParts.join(" ") || "";

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      if (profile.phone !== undefined) formData.append("phoneNumber", profile.phone);
      if (profile.dob !== undefined) formData.append("dob", profile.dob);
      if (profile.gender !== undefined) formData.append("gender", profile.gender);
      if (profile.address !== undefined) formData.append("address", profile.address);
      if (profile.city !== undefined) formData.append("city", profile.city);
      if (profile.link !== undefined) formData.append("link", profile.link);

      const res = await fetch(`${API_URL}/user/profile/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
          ...profile,
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          email: data.email,
          avatar: data.avaUrl || "",
          phone: data.candidate?.phoneNumber || profile.phone,
          dob: data.candidate?.dob || profile.dob,
          gender: data.candidate?.gender || profile.gender,
          address: data.candidate?.address || profile.address,
          city: data.candidate?.city || profile.city,
          link: data.candidate?.link || profile.link,
        });
        onProfileUpdate?.();
        setOpen(false);
      } else {
        const errBody = await res.json().catch(() => ({}));
        console.error("Profile update failed", res.status, errBody);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (profile.name || "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  const avatarSrc = getAvatarSrc(profile.avatar);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer">
          <Pencil className="w-3.5 h-3.5" />
          Chỉnh sửa
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl w-full p-0 gap-0 rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-500">
            <DialogTitle className="text-white font-bold text-lg">
              Thông tin cá nhân
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-xs mt-0.5">
              Cập nhật thông tin để nhà tuyển dụng dễ liên hệ
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Avatar section */}
            <div className="flex items-center gap-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-md">
                  {avatarSrc ? (
                    <img src={avatarSrc} className="w-full h-full object-cover" alt="" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Ảnh đại diện</p>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    Tải ảnh lên
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={!profile.avatar}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xoá
                  </button>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <FloatingInput
                label="Họ và Tên"
                value={profile.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nguyễn Văn A"
              />

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Địa chỉ email"
                  value={profile.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="example@email.com"
                  type="email"
                  disabled
                />
                <FloatingInput
                  label="Số điện thoại"
                  value={profile.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="0912 345 678"
                  type="tel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Ngày sinh"
                  type="date"
                  value={profile.dob || ""}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
                <div className="relative border border-gray-200 rounded-xl px-3 pt-5  focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                  <label className="absolute top-1.5 left-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    Giới tính
                  </label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(val) => handleChange("gender", val)}
                  >
                    <SelectTrigger className="w-full text-sm text-gray-800 border-none shadow-none bg-transparent px-0 h-auto focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="-- Chọn --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Tỉnh / Thành phố"
                  value={profile.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Hà Nội"
                />
                <FloatingInput
                  label="Địa chỉ chi tiết"
                  value={profile.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Số nhà, đường, quận..."
                />
              </div>

              <FloatingInput
                label="Link cá nhân (LinkedIn, Portfolio...)"
                value={profile.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50 flex gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                className="flex-1 border-gray-200 hover:bg-gray-100 cursor-pointer"
              >
                Huỷ
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
