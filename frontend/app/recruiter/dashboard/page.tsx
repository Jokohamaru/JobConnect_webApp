'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp,
  PlusCircle,
  Eye,
  UserCheck,
  Clock,
  Building2,
  MapPin,
  Globe,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { jobService } from "@/services/jobService";

export default function RecruiterDashboard() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && token) {
      const fetchJobs = async () => {
        try {
          setIsLoadingJobs(true);
          const data = await jobService.getRecruiterJobs(token, 'company');
          setJobs(data);
          setCurrentPage(1);
        } catch (error) {
          console.error('Failed to fetch recruiter jobs:', error);
        } finally {
          setIsLoadingJobs(false);
        }
      };
      fetchJobs();
    } else if (!isLoading && !isAuthenticated) {
      setIsLoadingJobs(false);
    }
  }, [isAuthenticated, isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalJobs = jobs.length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0);

  // Extract company info from job list
  const companyInfo = jobs.find((j) => j.company)?.company || null;

  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const displayedJobs = jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const stats = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: "Tin tuyển dụng",
      value: totalJobs.toString(),
      change: "Đang hoạt động",
      color: "bg-blue-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "Tổng ứng viên",
      value: totalApplications.toString(),
      change: "Tổng lượt nộp",
      color: "bg-green-500",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      label: "Lượt xem",
      value: (totalJobs * 12).toString(), // Mocked view count
      change: "Ước tính",
      color: "bg-purple-500",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      label: "Đã tuyển",
      value: "0",
      change: "Tháng này",
      color: "bg-orange-500",
    },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'Đang tuyển';
      case 'DRAFT': return 'Nháp';
      case 'PENDING_APPROVAL': return 'Chờ duyệt';
      case 'CLOSED': return 'Đã đóng';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chào mừng trở lại, {user?.fullName || user?.email}!
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý tin tuyển dụng và ứng viên của bạn
              </p>
            </div>
            <Link
              href="/recruiter/post-job"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/recruiter/post-job"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Đăng tin mới</h3>
                <p className="text-sm text-gray-600">Tạo tin tuyển dụng</p>
              </div>
            </div>
          </Link>

          <Link
            href="/recruiter/candidates"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Xem ứng viên</h3>
                <p className="text-sm text-gray-600">Quản lý hồ sơ</p>
              </div>
            </div>
          </Link>

          <Link
            href="/recruiter/candidates"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tin đã đăng</h3>
                <p className="text-sm text-gray-600">Quản lý tin tuyển dụng</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main grid: job list + company sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

          {/* LEFT — Recent Jobs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tin tuyển dụng gần đây
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Tất cả tin tuyển dụng đang tuyển dụng của công ty bạn
                </p>
              </div>
              <Link
                href="/recruiter/candidates"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium self-start sm:self-center"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="divide-y">
              {isLoadingJobs ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Đang tải tin tuyển dụng...
                </div>
              ) : displayedJobs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="font-medium">Chưa có tin tuyển dụng nào của công ty bạn</p>
                  <p className="text-sm text-gray-400 mt-1">Hãy đăng tin tuyển dụng đầu tiên của bạn để tiếp cận ứng viên.</p>
                </div>
              ) : (
                displayedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job._count?.applications || 0} ứng viên
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {12} lượt xem
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            job.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : job.status === "DRAFT"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {getStatusLabel(job.status)}
                        </span>
                        <Link
                          href={`/recruiter/jobs/${job.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Chi tiết →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between bg-white rounded-b-xl">
                <span className="text-sm text-gray-600 font-medium">
                  Trang {currentPage} / {totalPages} (Tổng {jobs.length} tin)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Company Info Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Cover gradient */}
              <div className="h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 relative">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />
              </div>

              {/* Logo */}
              <div className="px-5 py-10">
                <div className="-mt-8 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    {companyInfo?.logoUrl ? (
                      <img
                        src={companyInfo.logoUrl}
                        alt={companyInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-blue-500" />
                    )}
                  </div>
                </div>

                {isLoadingJobs ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-full mt-3" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                ) : companyInfo ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {companyInfo.name}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 mt-1.5 mb-3">
                      {companyInfo.type?.name && (
                        <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          {companyInfo.type.name}
                        </span>
                      )}
                      {companyInfo.size && (
                        <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {companyInfo.size} nhân viên
                        </span>
                      )}
                      <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                        {totalJobs} tin đang tuyển
                      </span>
                    </div>

                    {companyInfo.description && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">
                        {companyInfo.description}
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-gray-500">
                      {companyInfo.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{companyInfo.address}</span>
                        </div>
                      )}
                      {companyInfo.websiteUrl && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <a
                            href={companyInfo.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                          >
                            {companyInfo.websiteUrl.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>

            
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Chưa có thông tin công ty</p>
                    <p className="text-xs text-gray-400 mt-1">Liên hệ quản trị viên để cập nhật</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats mini card */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tổng quan nhanh</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    Tin đang đăng
                  </div>
                  <span className="text-sm font-bold text-gray-900">{totalJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-green-500" />
                    </div>
                    Tổng ứng viên
                  </div>
                  <span className="text-sm font-bold text-gray-900">{totalApplications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    Lượt xem
                  </div>
                  <span className="text-sm font-bold text-gray-900">{totalJobs * 12}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
