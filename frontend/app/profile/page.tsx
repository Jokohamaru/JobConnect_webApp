'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Briefcase, Save } from 'lucide-react';
import { patch } from '@/lib/api-client';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
      return;
    }
    
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
    }
  }, [isAuthenticated, authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await patch('/users/me', {
        full_name: fullName,
      });
      
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }

      showToast('Cập nhật thông tin thành công', 'success');
    } catch (err) {
      showToast('Không thể cập nhật thông tin', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="flex items-center text-sm font-medium mb-2">
                <User className="w-4 h-4 mr-2" />
                Họ và tên
              </Label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label className="flex items-center text-sm font-medium mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Email không thể thay đổi
              </p>
            </div>

            <div>
              <Label className="flex items-center text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 mr-2" />
                Vai trò
              </Label>
              <Input
                type="text"
                value={user.role}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Vai trò không thể thay đổi
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/profile/cvs">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quản lý CV</h3>
              <p className="text-gray-600 text-sm">Tải lên và quản lý CV của bạn</p>
            </div>
          </Link>
          
          <Link href="/applications">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đơn ứng tuyển</h3>
              <p className="text-gray-600 text-sm">Xem trạng thái đơn ứng tuyển</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
