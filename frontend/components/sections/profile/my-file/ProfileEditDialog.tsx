"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Trash2, Pencil } from "lucide-react";
import { useState } from "react";

function FloatingInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative border border-gray-200 rounded-xl px-3 pt-5 pb-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white group">
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
          className="w-full text-sm text-gray-800 outline-none bg-transparent placeholder-gray-300"
        />
      </div>
    </div>
  );
}

export function ProfileEditDialog({ profile, setProfile }: any) {
  const [open, setOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saved:", profile);
    setOpen(false);
  };

  const initials = (profile.name || "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

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
            <p className="text-blue-100 text-xs mt-0.5">Cập nhật thông tin để nhà tuyển dụng dễ liên hệ</p>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Avatar section */}
            <div className="flex items-center gap-5 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-md">
                  {profile.avatar ? (
                    <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Ảnh đại diện</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Tải ảnh lên
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
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
                <div className="relative border border-gray-200 rounded-xl px-3 pt-5 pb-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                  <label className="absolute top-1.5 left-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    Giới tính
                  </label>
                  <select
                    value={profile.gender || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full text-sm text-gray-800 outline-none bg-transparent"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white shadow-md cursor-pointer"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}