'use client'

import ProfileHeader from "@/components/sections/profile/HelloUser";
import ProfileMenu from "@/components/sections/profile/ProfileMenu";
import { useAuth } from "@/context/AuthContext";


// app/profile/layout.tsx
export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <div className="flex justify-center py-8 px-20 bg-[#F3F5F7] ">
      {/* Sidebar */}
      <div className="w-[20%] flex flex-col gap-6  sticky top-20 h-fit">
        <ProfileHeader nameUser={user?.fullName || ""} />
        <ProfileMenu/>
      </div>

      {/* Content */}
      <div className="w-[80%]">{children}</div>
    </div>
  );
}