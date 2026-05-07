import { SearchBar } from "@/components/sections/hero-section/SearchBar";
import FilterBar from "@/components/sections/filters/FilterBar";
import { MarketingInfo } from "@/components/sections/marketing-info";
import HintBar from "@/components/ui/TooltipHints";
import { JobCardProps } from "@/components/sections/jobs/JobCard";
import TopCareersSection from "@/components/sections/careers/TopCareersSection";
import JobSlider from "@/components/sections/jobs/JobSlider";
import { jobService } from "@/services/jobService";
import { mapJobToJobCard } from "@/utils/jobMapper";

export default async function HomePage() {
  let jobs: JobCardProps[] = [];
  
  try {
    const response = await jobService.getJobs({ pageSize: 27 });
    jobs = response.data.map(mapJobToJobCard);
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    // Fallback to empty array or show error message
  }

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
