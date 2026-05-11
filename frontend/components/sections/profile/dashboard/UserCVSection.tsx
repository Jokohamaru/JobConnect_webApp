"use client";

import { useState, useEffect } from "react";
import { CircleArrowRight, Trash2, FileText, Edit } from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface CV {
  id: string;
  title: string;
  cvUrl: string;
  cvType: 'UPLOADED' | 'BUILDER';
  cvData?: any;
  createdAt: string;
}

export default function UserCVSection() {
  const { token } = useAuth();
  const router = useRouter();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch CVs
  useEffect(() => {
    fetchCVs();
  }, [token]);

  const fetchCVs = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cvs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCvs(data);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete CV
  const handleDeleteCV = async (cvId: string) => {
    if (!token) return;
    
    if (!confirm('Bạn có chắc muốn xóa CV này?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Xóa CV thành công!');
        fetchCVs(); // Refresh danh sách
      } else {
        alert('Không thể xóa CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Có lỗi xảy ra khi xóa CV');
    }
  };

  // Handle CV click - open PDF or edit builder CV
  const handleCVClick = (cv: CV) => {
    if (cv.cvType === 'BUILDER' && cv.cvData) {
      // Lưu CV data vào sessionStorage và redirect đến CV builder
      sessionStorage.setItem('edit-cv-data', JSON.stringify({
        cvId: cv.id,
        cvData: cv.cvData,
      }));
      router.push(`/cv-builder/${cv.cvData.templateId}?edit=${cv.id}`);
    } else {
      // Mở PDF trong tab mới
      window.open(`${process.env.NEXT_PUBLIC_API_URL}${cv.cvUrl}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Hồ sơ của bạn</h3>
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Hồ sơ của bạn</h3>
      </div>

      {/* CV Grid */}
      <div className="flex gap-3 flex-wrap">
        {cvs.map((cv) => (
          <div 
            key={cv.id}
            className="relative h-50 w-40 bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-lg transition-all group cursor-pointer"
            onClick={() => handleCVClick(cv)}
          >
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCV(cv.id);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Xóa CV"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* CV Preview */}
            <div className="flex flex-col items-center justify-center h-32 mb-2 bg-gray-50 rounded relative">
              {cv.cvType === 'BUILDER' ? (
                <>
                  <FileText className="w-12 h-12 text-blue-500" />
                  <span className="text-xs text-gray-500 mt-2">CV Builder</span>
                  <Edit className="w-4 h-4 text-blue-500 absolute bottom-2 right-2" />
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 text-red-500" />
                  <span className="text-xs text-gray-500 mt-2">PDF</span>
                </>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 truncate text-center" title={cv.title}>
              {cv.title}
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              {new Date(cv.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        ))}

        {/* Explore Templates Card */}
        <div className="text-[13px] h-50 w-40 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
          <Link href="/cv" className="text-center">
            Khám phá mẫu CV 
            <CircleArrowRight className="mx-auto mt-2 text-[#2587C7]"/>
          </Link>    
        </div>  
      </div>

      {cvs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>Bạn chưa có CV nào. Hãy tạo CV mới!</p>
        </div>
      )}
    </div>
  );
}