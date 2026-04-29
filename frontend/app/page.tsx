'use client';

import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, TrendingUp, Bell, MessageSquare, User, LogOut, Settings, FileText, Bookmark, ChevronDown, X } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.append('search', searchKeyword);
    if (selectedLocation) params.append('location', selectedLocation);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const quickFilters = [
    'Xu hướng hiện nay',
    'IT',
    'Tài chính - ngân hàng',
    'Marketing'
  ];

  const locationFilters = [
    { name: 'Ngẫu nhiên', value: '' },
    { name: 'Hà Nội', value: 'Hà Nội' },
    { name: 'TP.HCM', value: 'TP.HCM' },
    { name: 'Miền Bắc', value: 'Miền Bắc' },
    { name: 'Miền Nam', value: 'Miền Nam' }
  ];

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">JobConnect</h1>
              </Link>
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600 font-medium">
                Việc làm
              </Link>
              {isAuthenticated && (
                <>
                  <div className="relative group">
                    <button className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1">
                      Công cụ
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <Link href="/career-guide" className="text-gray-700 hover:text-blue-600 font-medium">
                    Cẩm nang nghề nghiệp
                  </Link>
                  <Link href="/cv-builder" className="text-gray-700 hover:text-blue-600 font-medium">
                    Tạo CV bằng AI
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <button className="p-2 text-gray-600 hover:text-blue-600 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 font-medium hidden md:block">{user.full_name}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {showUserMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowUserMenu(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                          {/* User Info Header */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 text-lg">{user.full_name}</p>
                                <p className="text-sm text-gray-600">
                                  <span className="inline-flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Tài khoản xác thực
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  ID: {user.id.substring(0, 8)}...
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-700">
                              <p className="truncate">{user.email}</p>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link href="/profile" onClick={() => setShowUserMenu(false)}>
                              <div className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Tổng quan</span>
                              </div>
                            </Link>
                            <Link href="/profile" onClick={() => setShowUserMenu(false)}>
                              <div className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Hồ sơ của tôi</span>
                              </div>
                            </Link>
                            <Link href="/profile/cvs" onClick={() => setShowUserMenu(false)}>
                              <div className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Hồ sơ định kèm</span>
                              </div>
                            </Link>
                            <Link href="/applications" onClick={() => setShowUserMenu(false)}>
                              <div className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                                  <Bookmark className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Lời mời cộng việc</span>
                              </div>
                            </Link>
                            <Link href="/dashboard" onClick={() => setShowUserMenu(false)}>
                              <div className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Settings className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Cài đặt</span>
                              </div>
                            </Link>
                          </div>

                          {/* Logout Button */}
                          <div className="border-t border-gray-200 p-2">
                            <button
                              onClick={handleLogout}
                              className="w-full px-4 py-2.5 hover:bg-red-50 rounded-lg flex items-center gap-3 text-left transition-colors"
                            >
                              <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                                <LogOut className="w-4 h-4 text-red-600" />
                              </div>
                              <span className="text-red-600 font-medium">Đăng xuất</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline">Đăng nhập</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Đăng ký</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Job Connect - Tạo CV bằng AI, Tìm Việc Làm, Tuyển dụng hiệu quả
            </h1>
            <p className="text-lg text-blue-100">
              Tìm kiếm công việc tương lai của bạn với tính năng khám phá việc làm bằng AI
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Vị trí muốn tuyển dụng hoặc tên công ty..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 text-base border-gray-300"
                />
              </div>
              <div className="w-full md:w-48 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 h-12 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Địa điểm</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP.HCM">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
              </div>
              <Button onClick={handleSearch} className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700">
                Tìm Kiếm
              </Button>
            </div>

            {/* Quick Category Tags */}
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {quickFilters.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleFilter(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedFilters.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {tag}
                  {selectedFilters.includes(tag) && (
                    <X className="w-3 h-3 inline ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-blue-50 py-4 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-blue-900 text-sm md:text-base">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Mức lương & Thị trường tuyển dụng 2025–2026</span>
            <span className="hidden md:inline">Xu hướng mới từ công nghệ và nhu cầu nhân sự</span>
            <Link href="/jobs" className="ml-2 text-blue-600 hover:underline flex items-center gap-1">
              Tìm hiểu thêm →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Việc làm trending Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Việc làm trending</h2>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Đề xuất bởi JOBCN-AI
              </span>
            </div>
            <Link href="/jobs" className="text-blue-600 hover:underline font-medium">
              Xem toàn bộ →
            </Link>
          </div>

          {/* Location Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Dựa trên:</span>
            {locationFilters.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setSelectedLocation(loc.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedLocation === loc.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>

          {/* Suggestion Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <p className="text-gray-700">
                <strong>Gợi ý:</strong> Đi chuột vào tiêu đề việc làm để xem khái quát công việc
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Job Listings - Will be populated from API */}
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Đang tải danh sách việc làm...</p>
          <Link href="/jobs">
            <Button>Xem tất cả việc làm</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
