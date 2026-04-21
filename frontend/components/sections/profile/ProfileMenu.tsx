"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, User, Briefcase, FileText, Mail, Settings } from "lucide-react";
export default function ProfileMenu() {
  const pathname = usePathname();

  const menu = [
    { label: "Tổng quan", href: "/profile/dashboard", icon: Menu },
    { label: "Hồ sơ của tôi", href: "/profile/my-file", icon: User },
    { label: "Việc làm của tôi", href: "/profile/my-jobs", icon: Briefcase },
    { label: "Hồ sơ đính kèm", href: "/profile/cv-attachment", icon: FileText },
    { label: "Lời mời công viêc", href: "/profile/invites", icon: Mail },
    { label: "Cài đặt", href: "/profile/settings", icon: Settings },
  ];

  return (
    <div className=" bg-white rounded-2xl p-2 shadow-sm">
      {menu.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
        ${
          isActive
            ? "bg-[#B4D6EC] "
            : "hover:bg-[#B4D6EC]"
        }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
