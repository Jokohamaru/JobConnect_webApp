'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">JobConnect</h1>
              </Link>
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600 font-medium">
                Tìm việc làm
              </Link>
              <Link href="/applications" className="text-gray-700 hover:text-blue-600 font-medium">
                Đơn ứng tuyển
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Bảng điều khiển
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Xin chào, {user.full_name}</span>
              <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Bảng điều khiển</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-semibold text-lg mb-1">Email</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-semibold text-lg mb-1">Vai trò</h3>
              <p className="text-gray-600">{user.role}</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="font-semibold text-lg mb-1">Trạng thái</h3>
              <p className="text-gray-600">Đã xác thực</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Quản lý tài khoản</h3>
          <div className="space-y-3">
            <Link href="/profile">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                <span className="text-2xl">👤</span>
                <span>Thông tin cá nhân</span>
              </div>
            </Link>
            <Link href="/profile/cvs">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                <span className="text-2xl">📄</span>
                <span>Quản lý CV</span>
              </div>
            </Link>
            <Link href="/applications">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                <span className="text-2xl">📝</span>
                <span>Đơn ứng tuyển</span>
              </div>
            </Link>
            <Link href="/jobs">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                <span className="text-2xl">💼</span>
                <span>Tìm việc làm</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
