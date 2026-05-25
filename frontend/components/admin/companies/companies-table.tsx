"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Building, Users, Briefcase, Globe, MapPin } from "lucide-react";
import Image from "next/image";

interface Company {
  id: string;
  name: string;
  size: string | null;
  nation: string | null;
  address: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  type: string;
  jobsCount: number;
  recruitersCount: number;
  createdAt: string;
}

interface CompaniesTableProps {
  onAddCompany: () => void;
}

export function CompaniesTable({ onAddCompany }: CompaniesTableProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCompanies = async (page: number = 1, searchTerm: string = "") => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${apiUrl}/admin/companies?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPage, search);
  }, [currentPage, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getCompanyLogo = (logoUrl: string | null) => {
    if (!logoUrl) return "/placeholder-company.svg";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    // Đảm bảo không bị thiếu hoặc thừa dấu "/" khi nối link
    const cleanApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const cleanLogoUrl = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
    
    return `${cleanApiUrl}${cleanLogoUrl}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách công ty ({total})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin các công ty trong hệ thống
            </p>
          </div>
          <Button onClick={onAddCompany} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm công ty
          </Button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên công ty, địa chỉ, quốc gia..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Công ty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại hình
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thống kê
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy công ty nào
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-white rounded-xl border border-gray-200 shadow-sm p-1.5 flex items-center justify-center overflow-hidden">
                        <Image
                          unoptimized // THÊM DÒNG NÀY VÀO ĐỂ LÁCH LỖI NEXT.JS LOCAL
                          className="h-full w-full object-contain rounded-lg"
                          src={getCompanyLogo(company.logoUrl)}
                          alt={company.name}
                          width={64}
                          height={64}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-company.svg";
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        {company.websiteUrl && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <a
                              href={company.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {company.size && (
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {company.size}
                        </div>
                      )}
                      {company.nation && (
                        <div className="text-sm text-gray-500">
                          🌍 {company.nation}
                        </div>
                      )}
                      {company.address && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {company.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline">
                      {company.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {company.jobsCount} việc làm
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {company.recruitersCount} nhà tuyển dụng
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(company.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}