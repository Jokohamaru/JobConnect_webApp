"use client";
import Image from "next/image";
import {
  Mail,
  Gift,
  MapPin,
  Phone,
  User,
  Globe,
  Camera,
  Pencil,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { ProfileEditDialog } from "./ProfileEditDialog";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [profile, setProfile] = useState({
    avatar: "https://i.pravatar.cc/120",
    id: "",
    name: user.name || "",
    email: user.email || "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    link: "",
  });

  const infoItems = [
    { icon: <Mail className="w-4 h-4" />, value: profile.email, placeholder: "Email chưa cập nhật", color: "text-blue-500" },
    { icon: <Phone className="w-4 h-4" />, value: profile.phone, placeholder: "Số điện thoại", color: "text-green-500" },
    { icon: <Gift className="w-4 h-4" />, value: profile.dob, placeholder: "Ngày sinh", color: "text-orange-500" },
    { icon: <User className="w-4 h-4" />, value: profile.gender, placeholder: "Giới tính", color: "text-purple-500" },
    { icon: <MapPin className="w-4 h-4" />, value: profile.city || profile.address, placeholder: "Địa chỉ", color: "text-red-500" },
    { icon: <Globe className="w-4 h-4" />, value: profile.link, placeholder: "Link cá nhân", color: "text-cyan-500" },
  ];

  const initials = (profile.name || user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  const completionCount = [profile.email, profile.phone, profile.dob, profile.gender, profile.city || profile.address, profile.link].filter(Boolean).length;
  const completionPct = Math.round((completionCount / 6) * 100);

  return (
    <div className="rounded-2xl mb-6 shadow-sm border border-gray-100">
      {/* White card body - no banner */}
      <div className="bg-white px-8 pt-6 pb-6 rounded-2xl">
        <div className="flex items-center gap-5 mb-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-white text-2xl font-bold">{initials}</span>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          </div>

          {/* Name + badge */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {profile.name || user.name || "Chưa cập nhật tên"}
              </h1>
              {completionPct >= 80 && (
                <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />
              )}
            </div>
            {user.id && user.id !== "undefined" && (
              <p className="text-sm text-gray-400 mt-0.5">ID: #{user.id}</p>
            )}
          </div>

          {/* Edit button */}
          <div>
            <ProfileEditDialog profile={profile} setProfile={setProfile} />
          </div>
        </div>

        {/* Completion bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 font-medium">Độ hoàn thiện hồ sơ</span>
            <span className="text-xs font-semibold text-blue-600">{completionPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {infoItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50/60 transition-colors group"
            >
              <span className={`shrink-0 ${item.color} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </span>
              <span className={`text-sm truncate ${item.value ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                {item.value || item.placeholder}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
