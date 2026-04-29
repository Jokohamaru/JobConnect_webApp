'use client';

import { useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface JobFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    location?: string;
    job_type?: string;
    salary_min?: number;
  }) => void;
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryMin, setSalaryMin] = useState('');

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      location: location || undefined,
      job_type: jobType || undefined,
      salary_min: salaryMin ? parseInt(salaryMin) : undefined,
    });
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    setSalaryMin('');
    onFilterChange({});
  };

  const popularLocations = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
  const salaryRanges = [
    { label: 'Dưới 10 triệu', value: 0 },
    { label: '10-15 triệu', value: 10000000 },
    { label: '15-20 triệu', value: 15000000 },
    { label: '20-30 triệu', value: 20000000 },
    { label: 'Trên 30 triệu', value: 30000000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Tìm kiếm</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Vị trí, công ty, kỹ năng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Địa điểm</h3>
        <div className="space-y-2">
          {popularLocations.map((loc) => (
            <label key={loc} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="location"
                value={loc}
                checked={location === loc}
                onChange={(e) => setLocation(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">{loc}</span>
            </label>
          ))}
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="location"
              value=""
              checked={location === ''}
              onChange={(e) => setLocation(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Tất cả địa điểm</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Loại công việc</h3>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="jobType"
              value=""
              checked={jobType === ''}
              onChange={(e) => setJobType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Tất cả</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="jobType"
              value="FULL_TIME"
              checked={jobType === 'FULL_TIME'}
              onChange={(e) => setJobType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Toàn thời gian</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="jobType"
              value="PART_TIME"
              checked={jobType === 'PART_TIME'}
              onChange={(e) => setJobType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Bán thời gian</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="jobType"
              value="CONTRACT"
              checked={jobType === 'CONTRACT'}
              onChange={(e) => setJobType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Hợp đồng</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="jobType"
              value="INTERNSHIP"
              checked={jobType === 'INTERNSHIP'}
              onChange={(e) => setJobType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Thực tập</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Mức lương</h3>
        <div className="space-y-2">
          {salaryRanges.map((range) => (
            <label key={range.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="salary"
                value={range.value}
                checked={salaryMin === range.value.toString()}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t space-y-2">
        <Button onClick={handleApplyFilters} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          Áp dụng bộ lọc
        </Button>
        <Button onClick={handleReset} variant="outline" className="w-full">
          <X className="w-4 h-4 mr-2" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}
