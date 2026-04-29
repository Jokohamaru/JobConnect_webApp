'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMyApplications, Application, withdrawApplication } from '@/lib/api/applications';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, DollarSign, FileText, Trash2 } from 'lucide-react';

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/applications');
      return;
    }
    loadApplications();
  }, [isAuthenticated]);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyApplications();
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setApplications(response.data);
      }
    } catch (err) {
      setError('Không thể tải danh sách đơn ứng tuyển');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) {
      return;
    }

    try {
      const response = await withdrawApplication(id);
      
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }

      showToast('Đã rút đơn ứng tuyển', 'success');
      loadApplications();
    } catch (err) {
      showToast('Không thể rút đơn ứng tuyển', 'error');
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const styles = {
      APPLIED: 'bg-blue-100 text-blue-700',
      REVIEWING: 'bg-yellow-100 text-yellow-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };

    const labels = {
      APPLIED: 'Đã ứng tuyển',
      REVIEWING: 'Đang xem xét',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Đã từ chối',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatSalary = (min: number, max: number) => {
    return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ`;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">JobConnect</h1>
              </Link>
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600 font-medium">
                Tìm việc làm
              </Link>
              <Link href="/applications" className="text-blue-600 font-medium">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn ứng tuyển của tôi</h1>
          <p className="text-gray-600">Theo dõi trạng thái các đơn ứng tuyển</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có đơn ứng tuyển nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu tìm kiếm và ứng tuyển vào các công việc phù hợp với bạn
            </p>
            <Link href="/jobs">
              <Button>Tìm việc làm</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/jobs/${application.job_id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
                        {application.job?.title}
                      </h3>
                    </Link>
                    <p className="text-gray-700 font-medium mb-2">
                      {application.job?.company.name}
                    </p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{application.job?.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 text-sm">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>
                      {application.job && formatSalary(application.job.salary_min, application.job.salary_max)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{application.cv?.file_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Ứng tuyển ngày: {formatDate(application.created_at)}
                  </p>
                  
                  {application.status === 'APPLIED' && (
                    <Button
                      variant="outline"
                      onClick={() => handleWithdraw(application.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Rút đơn
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
