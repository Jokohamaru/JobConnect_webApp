'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMyCVs, deleteCV, setDefaultCV, CV } from '@/lib/api/cvs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Trash2, Star, Upload } from 'lucide-react';

export default function CVsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/profile/cvs');
      return;
    }
    loadCVs();
  }, [isAuthenticated]);

  const loadCVs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyCVs();
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setCvs(response.data);
      }
    } catch (err) {
      setError('Không thể tải danh sách CV');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Chỉ chấp nhận file PDF hoặc Word', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File không được vượt quá 5MB', 'error');
      return;
    }

    setUploading(true);

    try {
      // Note: This is a mock implementation
      // In real app, you would upload to server
      showToast('Tính năng tải CV đang được phát triển', 'info');
      
      // Mock CV creation
      const mockCV: CV = {
        id: Date.now().toString(),
        candidate_id: 'current-user',
        file_name: file.name,
        file_path: '/uploads/' + file.name,
        is_default: cvs.length === 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setCvs([...cvs, mockCV]);
      showToast('CV đã được tải lên thành công', 'success');
    } catch (err) {
      showToast('Không thể tải lên CV', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa CV này?')) {
      return;
    }

    try {
      const response = await deleteCV(id);
      
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }

      showToast('Đã xóa CV', 'success');
      loadCVs();
    } catch (err) {
      showToast('Không thể xóa CV', 'error');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await setDefaultCV(id);
      
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }

      showToast('Đã đặt làm CV mặc định', 'success');
      loadCVs();
    } catch (err) {
      showToast('Không thể đặt CV mặc định', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý CV</h1>
          <p className="text-gray-600">Tải lên và quản lý CV của bạn</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <Label className="text-lg font-semibold mb-4 block">Tải lên CV mới</Label>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Chấp nhận file PDF, DOC, DOCX. Tối đa 5MB.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* CVs List */}
        {cvs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có CV nào
            </h3>
            <p className="text-gray-600">
              Tải lên CV đầu tiên của bạn để bắt đầu ứng tuyển
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cvs.map((cv) => (
              <div key={cv.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="w-8 h-8 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cv.file_name}
                        </h3>
                        {cv.is_default && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Tải lên ngày: {formatDate(cv.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!cv.is_default && (
                      <Button
                        variant="outline"
                        onClick={() => handleSetDefault(cv.id)}
                        className="text-sm"
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Đặt mặc định
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(cv.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
