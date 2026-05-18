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
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ProfileEditDialog } from "./ProfileEditDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/auth-service";

interface ProfileHeaderProps {
  onProfileUpdate?: () => void;
}

export default function ProfileHeader({ onProfileUpdate }: ProfileHeaderProps) {
  const { token: contextToken } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Luôn lấy token mới nhất (context hoặc localStorage)
  const getToken = () => contextToken || authService.getToken();

  const [profile, setProfile] = useState({
    avatar: "",
    id: "",
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    link: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch đầy đủ profile từ API
  const fetchProfile = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          avatar: data.avaUrl || "",
          id: data.id || "",
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          email: data.email || "",
          phone: data.candidate?.phoneNumber || "",
          dob: data.candidate?.dob || "",
          gender: data.candidate?.gender || "",
          address: data.candidate?.address || "",
          city: data.candidate?.city || "",
          link: data.candidate?.link || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch khi token sẵn sàng
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchProfile();
    } else {
      // Đợi context load xong rồi thử lại
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextToken]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const token = getToken();
    if (!file || !token) return;

    setIsUploading(true);
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
        setProfile((prev) => ({ ...prev, avatar: data.avaUrl || "" }));
        onProfileUpdate?.();
      } else {
        console.error("Avatar upload failed");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getAvatarSrc = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return url;
  };

  const infoItems = [
    { icon: <Mail className="w-4 h-4" />, value: profile.email, placeholder: "Email chưa cập nhật", color: "text-blue-500" },
    { icon: <Phone className="w-4 h-4" />, value: profile.phone, placeholder: "Số điện thoại", color: "text-green-500" },
    { icon: <Gift className="w-4 h-4" />, value: profile.dob, placeholder: "Ngày sinh", color: "text-orange-500" },
    { icon: <User className="w-4 h-4" />, value: profile.gender, placeholder: "Giới tính", color: "text-purple-500" },
    { icon: <MapPin className="w-4 h-4" />, value: profile.city || profile.address, placeholder: "Địa chỉ", color: "text-red-500" },
    { icon: <Globe className="w-4 h-4" />, value: profile.link, placeholder: "Link cá nhân", color: "text-cyan-500" },
  ];

  const initials = (profile.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  const completionCount = [
    profile.email, profile.phone, profile.dob,
    profile.gender, profile.city || profile.address, profile.link,
  ].filter(Boolean).length;
  const completionPct = Math.round((completionCount / 6) * 100);
  const avatarDisplayUrl = getAvatarSrc(profile.avatar);

  if (isLoading) {
    return (
      <div className="rounded-2xl mb-6 shadow-sm border border-gray-100 bg-white px-8 py-10 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl mb-6 shadow-sm border border-gray-100">
      <div className="bg-white px-8 pt-6 pb-6 rounded-2xl">
        <div className="flex items-center gap-5 mb-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-md bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              {avatarDisplayUrl ? (
                <Image
                  src={avatarDisplayUrl}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-white text-2xl font-bold">{initials}</span>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md p-0 z-10"
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </Button>
          </div>

          {/* Name + badge */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {profile.name || "Chưa cập nhật tên"}
              </h1>
              {completionPct >= 80 && (
                <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />
              )}
            </div>
            {profile.id && profile.id !== "undefined" && (
              <p className="text-sm text-gray-400 mt-0.5">ID: #{profile.id}</p>
            )}
          </div>

          {/* Edit button */}
          <div>
            <ProfileEditDialog
              profile={profile}
              setProfile={setProfile}
              onProfileUpdate={() => {
                fetchProfile();
                onProfileUpdate?.();
              }}
            />
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
