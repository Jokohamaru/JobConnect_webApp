'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobById, Job } from '@/lib/api/jobs';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Building2,
  ArrowLeft,
  Loader2 
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadJob(params.id as string);
    }
  }, [params.id]);

  const loadJob = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getJobById(id);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setJob(response.data);
      }
    } catch (err) {
      setError('Không thể tải thông tin việc làm');
    } finally {
      setLoading(false);
    }
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

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/jobs/' + params.id);
      return;
    }
    router.push(`/jobs/${params.id}/apply`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy việc làm
          </h2>
          <p className="text-gray-600 mb-4">{error || 'Việc làm không tồn tại'}</p>
          <Link href="/jobs">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Job Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <Building2 className="w-5 h-5 mr-2" />
                <span className="text-lg font-medium">{job.company.name}</span>
              </div>
            </div>
            {job.company.logo_url && (
              <img 
                src={job.company.logo_url} 
                alt={job.company.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
          </div>

          {/* Job Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Địa điểm</div>
                <div className="font-medium">{job.location}</div>
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <DollarSign className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Mức lương</div>
                <div className="font-medium">{formatSalary(job.salary_min, job.salary_max)}</div>
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Briefcase className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Loại công việc</div>
                <div className="font-medium">{job.job_type}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              <Clock className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="text-sm text-gray-500">Ngày đăng</div>
                <div className="font-medium">{formatDate(job.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Kỹ năng yêu cầu</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                  >
                    {tag.tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả công việc</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Apply Button */}
          <div className="border-t pt-6">
            <Button 
              onClick={handleApply}
              className="w-full md:w-auto px-8 py-6 text-lg"
            >
              Ứng tuyển ngay
            </Button>
            {!isAuthenticated && (
              <p className="text-sm text-gray-500 mt-2">
                Bạn cần đăng nhập để ứng tuyển
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
