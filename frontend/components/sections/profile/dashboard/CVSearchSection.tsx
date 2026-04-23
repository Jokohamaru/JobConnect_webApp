// components/profile/CVSearchSection.tsx
import { ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

export default function CVSearchSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Hồ sơ đính kèm của bạn
      </h3>

      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 text-sm mb-4">
          Bạn chưa đính kèm CV. Tải lên CV của bạn để dễ dàng hơn khi xin việc.
        </p>
        <Link href="/profile/cv-attachment" className="mt-4 px-20 text-red-500 hover:text-red-600 text-sm font-medium flex items-center justify-center gap-1 transition-colors">
          Quản lý hồ sơ đính kèm <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}