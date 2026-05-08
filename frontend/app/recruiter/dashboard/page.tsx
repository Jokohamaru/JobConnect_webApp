'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp,
  PlusCircle,
  Eye,
  UserCheck,
  Clock
} from "lucide-react";

export default function RecruiterDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  // Mock data - replace with real data from API
  const stats = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      label: "Tin tuyển dụng",
      value: "12",
      change: "+2 tuần này",
      color: "bg-blue-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "Ứng viên mới",
      value: "48",
      change: "+15 hôm nay",
      color: "bg-green-500",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      label: "Lượt xem",
      value: "1,234",
      change: "+234 tuần này",
      color: "bg-purple-500",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      label: "Đã tuyển",
      value: "8",
      change: "Tháng này",
      color: "bg-orange-500",
    },
  ];

  const recentJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      status: "Đang tuyển",
      applications: 24,
      views: 156,
      postedDate: "2 ngày trước",
    },
    {
      id: 2,
      title: "Backend Engineer",
      status: "Đang tuyển",
      applications: 18,
      views: 98,
      postedDate: "5 ngày trước",
    },
    {
      id: 3,
      title: "UI/UX Designer",
      status: "Đã đóng",
      applications: 32,
      views: 201,
      postedDate: "1 tuần trước",
    },
  ];

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
            href="/recruiter/jobs"
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

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Tin tuyển dụng gần đây
              </h2>
              <Link
                href="/recruiter/jobs"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>

          <div className="divide-y">
            {recentJobs.map((job) => (
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
                        {job.applications} ứng viên
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {job.views} lượt xem
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.postedDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === "Đang tuyển"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {job.status}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
