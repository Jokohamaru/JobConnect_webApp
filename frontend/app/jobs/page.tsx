'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobs, Job, JobFilters as JobFiltersType } from '@/lib/api/jobs';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    limit: 12,
    search: searchParams.get('search') || undefined,
    location: searchParams.get('location') || undefined,
  });
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getJobs(filters);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        if (filters.page === 1) {
          setJobs(response.data);
        } else {
          setJobs(prev => [...prev, ...response.data!]);
        }
        setHasMore(response.data.length === filters.limit);
      }
    } catch (err) {
      setError('Không thể tải danh sách việc làm');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<JobFiltersType>) => {
    setFilters({
      ...newFilters,
      page: 1,
      limit: 12,
    });
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">JobConnect</h1>
              </Link>
              <Link href="/jobs" className="text-blue-600 font-medium">
                Việc làm
              </Link>
              {user && (
                <>
                  <Link href="/applications" className="text-gray-700 hover:text-blue-600 font-medium">
                    Đơn ứng tuyển
                  </Link>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                    Bảng điều khiển
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/profile">
                    <span className="text-gray-700 hover:text-blue-600 cursor-pointer">
                      {user.full_name}
                    </span>
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700">
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline">Đăng nhập</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Đăng ký</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tìm việc làm</h1>
              <p className="text-gray-600 mt-1">
                Khám phá hàng ngàn cơ hội việc làm phù hợp với bạn
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <JobFilters onFilterChange={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Jobs List */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            {loading && filters.page === 1 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy việc làm
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                </p>
                <Link href="/jobs">
                  <Button>Xóa bộ lọc</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    Tìm thấy <span className="font-semibold text-gray-900">{jobs.length}+</span> việc làm
                  </p>
                  <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option>Mới nhất</option>
                    <option>Lương cao nhất</option>
                    <option>Phù hợp nhất</option>
                  </select>
                </div>

                <div className="space-y-4 mb-8">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-8"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        'Xem thêm việc làm'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
