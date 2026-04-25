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
import { Input } from "@/components/ui/input";
import { SquarePen, Camera, XIcon } from "lucide-react";
import { useState } from "react";
import { Trash2 } from 'lucide-react';
function FloatingInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="relative border border-gray-300 rounded-md px-3 pt-4 pb-2 focus-within:border-blue-500 transition-colors">
      <label className="absolute top-1.5 left-3 text-xs text-gray-400">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full text-sm text-gray-800 outline-none bg-transparent"
      />
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="mr-6 relative cursor-pointer">
        <SquarePen className="text-[#207FE5]" />
      </DialogTrigger>

      <DialogContent className="max-w-3xl w-full">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4 border-b-2 border-gray-200 flex">
            <DialogTitle className="text-lg font-semibold pb-4 ">
              Thông tin cá nhân
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} className="w-full h-full object-cover" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase() || "T"
                )}
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" className="flex items-center gap-1 text-blue-500 hover:underline cursor-pointer">
                  <span><Camera className="w-4 h-4"/></span> Sửa
                </button>
                <button type="button" className="flex items-center gap-1 text-gray-500 hover:underline cursor-pointer">
                  <span><Trash2 className="w-4 h-4"/></span> Xoá
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-3">
              <FloatingInput
                label="Họ và Tên"
                value={profile.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Địa chỉ email"
                  value={profile.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <FloatingInput
                  label="Số điện thoại"
                  value={profile.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Ngày sinh"
                  type="date"
                  value={profile.dob || ""}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
                <FloatingInput
                  label="Giới tính"
                  value={profile.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Tỉnh/Thành phố hiện tại"
                  value={profile.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
                <FloatingInput
                  label="Địa chỉ (Tên đường, quận/huyện,...)"
                  value={profile.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              <FloatingInput
                label="Link cá nhân (Linkedin, porfolio,...)"
                value={profile.link || ""}
                onChange={(e) => handleChange("link", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" type="button" className="cursor-pointer bg-blue-200 hover:bg-blue-500">
                Huỷ
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-400 text-white cursor-pointer">
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}