"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building, MapPin, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  recruiter: {
    id: string;
    name: string;
    email: string;
  };
  location: string;
  salary: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "PENDING" | "PUBLISHED" | "CLOSED" | "EXPIRED";
  applicationsCount: number;
  createdAt: string;
  expiresAt: string;
}

interface JobsTableProps {
  onAddJob?: () => void;
}

const statusConfig = {
  DRAFT: { label: "Nháp", color: "bg-gray-100 text-gray-800" },
  PENDING_APPROVAL: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
  PENDING: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
  PUBLISHED: { label: "Đang tuyển", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "Đã đóng", color: "bg-gray-100 text-gray-800" },
  EXPIRED: { label: "Hết hạn", color: "bg-red-100 text-red-800" },
};

const getStatusConfig = (status: string) => {
  return (
    statusConfig[status as keyof typeof statusConfig] || {
      label: status || "Chưa xác định",
      color: "bg-gray-100 text-gray-800",
    }
  );
};

export function JobsTable({ onAddJob }: JobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`${apiUrl}/admin/jobs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const result = await response.json();
      setJobs(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getCompanyLogo = (logoUrl: string | null) => {
    if (!logoUrl) return "/placeholder-company.svg";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${apiUrl}${logoUrl}`;
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-none">
        <CardContent className="p-6">
          <div className="text-center py-8">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-none">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-bold">Danh sách Việc làm</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, công ty..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            {onAddJob && (
              <Button
                onClick={onAddJob}
                className="bg-blue-600 hover:bg-blue-700 h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm việc làm
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Việc làm
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Công ty
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nhà tuyển dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 max-w-xs truncate" title={job.title}>
                      {job.title}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border mr-3">
                        <Image
                          src={getCompanyLogo(job.company.logoUrl)}
                          alt={job.company.name}
                          width={32}
                          height={32}
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-company.svg";
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {job.company.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {job.recruiter.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {job.recruiter.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {job.applicationsCount} ứng viên
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const config = getStatusConfig(job.status);
                      return (
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(job.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
