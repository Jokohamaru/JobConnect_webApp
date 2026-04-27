"use client";
import Image from "next/image";
import {
  ChevronRight,
  Mail,
  Gift,
  MapPin,
  Phone,
  User,
  Globe,
} from "lucide-react";
import Link from "next/link";
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
    avatar: "https://i.pravatar.cc/40",
    id: "",
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
  });
  return (
    <div className="bg-white rounded-xl shadow-sm py-6 pl-6 mb-6 flex justify-between ">
      <div className="flex gap-4 w-[90%]">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
          <Image
            src={profile.avatar}
            className="object-cover"
            alt={profile.name}
            fill
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="text-2xl font-bold text-gray-800">{user.name}</div>
          <p>ID: {user.id}</p>
          <div className="grid grid-cols-2 gap-3 my-5 border-l border-r border-gray-300 px-1 w-[80%]  ">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              {profile.email ? (
                <p className="text-gray-400 ">{profile.email}</p>
              ) : (
                <p className="text-gray-400 ">Email</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Gift className="w-4 h-4" />
              {profile.dob ? (
                <p className="text-gray-400 ">{profile.dob}</p>
              ) : (
                <p className="text-gray-400 ">Ngày sinh</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {profile.address ? (
                <p className="text-gray-400 ">{profile.address}</p>
              ) : (
                <p className="text-gray-400 ">Địa chỉ</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              {profile.phone ? (
                <p className="text-gray-400 ">{profile.phone}</p>
              ) : (
                <p className="text-gray-400 ">Số điện thoại</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              {profile.gender ? (
                <p className="text-gray-400 ">{profile.gender}</p>
              ) : (
                <p className="text-gray-400 ">Giới tính</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              {profile.address ? (
                <p className="text-gray-400 ">{profile.address}</p>
              ) : (
                <p className="text-gray-400 ">Địa chỉ liên kết</p>
              )}
            </div>
          </div>
        </div>
        {/* Update Profile Link */}
      </div>
      <div className="float-right">
        <ProfileEditDialog profile={profile} setProfile={setProfile} />
      </div>
    </div>
  );
}
