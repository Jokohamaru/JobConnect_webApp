"use client";

import { useState, useEffect, useCallback } from "react";
import FilterBar, { LocationFilter } from "@/components/sections/filters/FilterBar";
import HintBar from "@/components/ui/TooltipHints";
import JobSlider from "@/components/sections/jobs/JobSlider";
import { JobCardProps } from "@/components/sections/jobs/JobCard";
import { jobService } from "@/services/jobService";
import { mapJobToJobCard } from "@/utils/jobMapper";

// Mapping filter label => cityName query param
const CITY_FILTER_MAP: Record<string, string | null> = {
  "Ngẫu nhiên": null,
  "Hà Nội": "Hà Nội",
  "TP.Hồ Chí Minh": "Hồ Chí Minh",
  "Miền Nam": "Hồ Chí Minh", // Miền Nam bao gồm HCM + các tỉnh, tạm dùng HCM
};

interface TrendingJobsSectionProps {
  initialJobs: JobCardProps[];
}

/**
 * Shuffle mảng ngẫu nhiên (Fisher-Yates)
 */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TrendingJobsSection({ initialJobs }: TrendingJobsSectionProps) {
  const [jobs, setJobs] = useState<JobCardProps[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<LocationFilter>("Ngẫu nhiên");

  const fetchJobs = useCallback(async (filter: LocationFilter) => {
    setLoading(true);
    try {
      const cityName = CITY_FILTER_MAP[filter];

      if (filter === "Ngẫu nhiên") {
        // Lấy tất cả jobs rồi shuffle
        const response = await jobService.getJobs({ pageSize: 27 });
        const mapped = response.data.map(mapJobToJobCard);
        setJobs(shuffleArray(mapped));
      } else {
        // Lọc theo thành phố
        const response = await jobService.getJobs({
          pageSize: 27,
          cityName: cityName ?? undefined,
        });
        setJobs(response.data.map(mapJobToJobCard));
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = (filter: LocationFilter) => {
    setActiveFilter(filter);
    fetchJobs(filter);
  };

  return (
    <>
      <FilterBar onFilterChange={handleFilterChange} initialFilter={activeFilter} />
      <HintBar />
      <div className="relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-blue-600 font-medium text-sm">Đang tải...</span>
            </div>
          </div>
        )}
        {!loading && jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold">Không tìm thấy việc làm</p>
            <p className="text-sm mt-1">Thử chọn khu vực khác hoặc bấm "Ngẫu nhiên"</p>
          </div>
        ) : (
          <JobSlider jobs={jobs} />
        )}
      </div>
    </>
  );
}
