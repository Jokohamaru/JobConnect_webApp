"use client";

import { useState } from "react";
import { Bell, Search, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm..." 
            className="pl-9 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
        
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-full pr-3 transition-colors"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            A
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} 
          />
        </div>
      </div>
    </header>
  );
}
