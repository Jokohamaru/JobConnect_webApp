import { SearchBar } from "@/components/sections/hero-section/SearchBar";
import FilterBar from "@/components/sections/filters/FilterBar";
import { MarketingInfo } from "@/components/sections/marketing-info";
import HintBar from "@/components/ui/TooltipHints";
import JobCard, { JobCardProps } from "@/components/sections/jobs/JobCard";
import TopCareersSection from "@/components/sections/careers/TopCareersSection";
import JobSlider from "@/components/sections/jobs/JobSlider";

export default function HomePage() {
  const jobs: JobCardProps[] = Array.from({ length: 18 }).map((_, i) => ({
  nameJob: `Công việc ${i + 1}`,
  nameCompany: "Công ty ABC",
  logoCompanyURL: "",
  salary: "10 - 15 triệu",
  locate: "Hà Nội",
  deadline: "30/12/2026",
  experience: "1 năm",
  descriptions: ["Mô tả..."],
  requests: ["Yêu cầu..."],
  benefits: ["Quyền lợi..."],
  address: ["Hà Nội"],
}));
  return (
    <div className="bg-[#F3F5F7] ">
      <SearchBar />
      <div className="px-20">
        <MarketingInfo />
        <FilterBar />
        <HintBar />
        <div className="">
          <JobSlider jobs={jobs} />

          
        </div>
        <div>
          <TopCareersSection />
        </div>
      </div>
    </div>
  );
}
