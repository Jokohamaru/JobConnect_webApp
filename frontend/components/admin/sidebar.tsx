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
  ChevronLeft,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { title: "Bảng điều khiển", icon: LayoutDashboard, href: "/admin/dashboard" },
  { title: "Việc làm", icon: Briefcase, href: "/admin/jobs" },
  { title: "Nhà tuyển dụng", icon: Building2, href: "/admin/recruiter" },
  { title: "Công ty", icon: Building, href: "/admin/companies" },
  { title: "Người dùng", icon: Users, href: "/admin/users" },
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
        "bg-[#DFEDF8] border-r border-gray-100 flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className={cn(
        "h-16 flex items-center border-b border-gray-100 px-3",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex flex-col items-center gap-0.5 text-blue-700 font-bold text-sm hover:text-blue-900 transition-colors"
          >
            <span>JC</span>
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </button>
        ) : (
          <>
            <Link href="/admin" className="flex items-center overflow-hidden">
              <img
                src="/images/Logo_Job_Connect_3-removebg-preview.png"
                alt="JobConnect"
                width={140}
                height={44}
                className="object-contain"
              />
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="ml-2 p-1.5 rounded-md hover:bg-blue-100 text-gray-500 hover:text-blue-700 transition-colors shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* User Info */}
      <div className={cn(
        "border-b border-gray-100 flex items-center",
        collapsed ? "justify-center p-3" : "gap-3 p-4"
      )}>
        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0 text-sm">
          {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">{user?.fullName || "Admin"}</span>
            <span className="text-xs text-gray-500 truncate uppercase tracking-wide">{user?.role || "Quản trị viên"}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5",
                isActive 
                  ? "bg-[#277CD8] text-white" 
                  : "text-gray-700 hover:bg-blue-100 hover:text-blue-800"
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
          title={collapsed ? "Đăng xuất" : undefined}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium w-full transition-colors text-gray-700 hover:bg-blue-100 hover:text-blue-800",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 text-blue-600" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </nav>
    </aside>
  );
}
