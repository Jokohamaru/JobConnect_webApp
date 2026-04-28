'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RegisterHeader() {
  return (
    <div className="">
      {/* Nút quay lại trang đăng nhập */}
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#2E8CC9] transition-colors mb-5 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại đăng nhập
      </Link>

      <h1 className="text-2xl font-bold text-[#2E8CC9] mb-3">
        Chào mừng bạn đến với JobConnect
      </h1>
 
    </div>
  );
}