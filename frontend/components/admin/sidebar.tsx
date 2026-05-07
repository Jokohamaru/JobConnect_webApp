"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Users, 
  List, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { title: "Bảng điều khiển", icon: LayoutDashboard, href: "/admin/dashboard" },
  { title: "Việc làm", icon: Briefcase, href: "/admin/jobs" },
  { title: "Nhà tuyển dụng", icon: Building2, href: "/admin/recruiter" },
  { title: "Người dùng", icon: Users, href: "/admin/candidates" },
  { title: "Danh mục", icon: List, href: "/admin/categories" },
  { title: "Báo cáo", icon: BarChart3, href: "/admin/reports" },
  { title: "Cài đặt", icon: Settings, href: "/admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (  
    <aside 
      className={cn(
        "bg-[#DFEDF8] border-r border-gray-100 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <Link href="/admin" className="font-bold text-xl text-blue-600 truncate mx-auto">
            <img className="h-full" src="/images/Logo_Job_Connect_3-removebg-preview.png" alt="JobConnect" width={150} height={50} />
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="font-bold text-xl text-black mx-auto">
            JC
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden lg:flex hidden shrink-0" 
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
          {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
        </div>
        {!collapsed && (
          <div className="flex flex-col truncate">
            <span className="font-semibold text-sm">{user?.fullName || "Admin"}</span>
            <span className="text-xs text-gray-500">{user?.role || "Admin"}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/admin" && pathname === "/admin");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[#277CD8] text-white" 
                  : "text-black hover:bg-gray-100 hover:text-black"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-blue-600")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors text-black hover:bg-gray-100 "
        >
          <LogOut className="h-5 w-5 shrink-0 text-blue-600" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </nav>
    </aside>
  );
}
