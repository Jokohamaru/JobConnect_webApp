
import Image from "next/image";
import { ChevronRight, Mail } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function ProfileHeader({
  id,
  name,
  email,
  avatarUrl,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
          <Image
            src={avatarUrl || "https://i.pravatar.cc/40"}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>ID: </span>
            <span>{id}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Email: </span>
            <span>{email}</span>
          </div>
        </div>
        {/* Update Profile Link */}
      </div>
        <Link
          href="/profile/my-file"
          className="mt-4 px-20 text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          Cập nhật hồ sơ
          <ChevronRight className="w-4 h-4" />
        </Link>
    </div>
  );
}
