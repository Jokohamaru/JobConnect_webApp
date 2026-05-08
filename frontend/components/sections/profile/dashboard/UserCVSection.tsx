
"use client";

import { useState, useEffect } from "react";
import { CircleArrowRight, Trash2, Upload, FileText } from 'lucide-react';
import Link from "next/link";
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
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
        // Chỉ lấy CV type UPLOADED (file PDF thực tế)
        const uploadedCVs = data.filter((cv: CV) => cv.cvType === 'UPLOADED');
        setCvs(uploadedCVs);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload CV
  const handleUploadCV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Chỉ chấp nhận file PDF!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File không được vượt quá 5MB!');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace('.pdf', ''));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cvs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Upload CV thành công!');
        fetchCVs(); // Refresh danh sách
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.message || 'Không thể upload CV'}`);
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Có lỗi xảy ra khi upload CV');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
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
        
        {/* Upload Button */}
        <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Upload className="w-4 h-4" />
          {uploading ? 'Đang tải...' : 'Tải CV lên'}
          <input
            type="file"
            accept=".pdf"
            onChange={handleUploadCV}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* CV Grid */}
      <div className="flex gap-3 flex-wrap">
        {cvs.map((cv) => (
          <div 
            key={cv.id}
            className="relative h-50 w-40 bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-lg transition-all group"
          >
            {/* Delete Button */}
            <button
              onClick={() => handleDeleteCV(cv.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Xóa CV"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* CV Preview */}
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL}${cv.cvUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="flex flex-col items-center justify-center h-32 mb-2 bg-gray-50 rounded">
                <FileText className="w-12 h-12 text-red-500" />
                <span className="text-xs text-gray-500 mt-2">PDF</span>
              </div>
              <p className="text-sm font-medium text-gray-700 truncate text-center" title={cv.title}>
                {cv.title}
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                {new Date(cv.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </a>
          </div>
        ))}

        {/* Explore Templates Card */}
        <div className="text-[13px] h-50 w-40 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
          <Link href="/cv-builder" className="text-center">
            Khám phá mẫu CV 
            <CircleArrowRight className="mx-auto mt-2 text-[#2587C7]"/>
          </Link>    
        </div>  
      </div>

      {cvs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <p>Bạn chưa có CV nào. Hãy tải lên CV của bạn!</p>
        </div>
      )}
    </div>
  );
}
