import type { Metadata } from "next";
import { SearchBar } from "@/components/sections/hero-section/SearchBar";
import { MarketingInfo } from "@/components/sections/marketing-info";
import { JobCardProps } from "@/components/sections/jobs/JobCard";
import TrendingJobsSection from "@/components/sections/jobs/TrendingJobsSection";
import { jobService } from "@/services/jobService";
import { mapJobToJobCard } from "@/utils/jobMapper";

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "Tìm kiếm công việc phù hợp với kỹ năng và mức lương mong muốn. Hàng ngàn cơ hội việc làm đang chờ bạn.",
};

export default async function HomePage() {
  let jobs: JobCardProps[] = [];

  try {
    const response = await jobService.getJobs({ pageSize: 27 });
    jobs = response.data.map(mapJobToJobCard);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
  }

  return (
    <div className="bg-[#F3F5F7] pb-10">
      <SearchBar />
      <div className="px-20">
        <MarketingInfo />
        <TrendingJobsSection initialJobs={jobs} />
      </div>
    </div>
  );
}
