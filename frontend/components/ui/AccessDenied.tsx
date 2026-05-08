'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from './button';

export default function AccessDenied() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'access_denied') {
      setShow(true);
      
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        // Remove error param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.toString());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600">
            Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản phù hợp.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => {
              setShow(false);
              router.push('/');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
          
          <Button
            onClick={() => {
              setShow(false);
              router.push('/auth/login');
            }}
            variant="outline"
            className="w-full"
          >
            Đăng nhập lại
          </Button>
        </div>
      </div>
    </div>
  );
}
