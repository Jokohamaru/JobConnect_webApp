import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { jobService } from "@/services/jobService";
import { companyService } from "@/services/companyService";
import type { Metadata } from "next";
import { Job } from "@/types/job";
import { Company } from "@/types/company";

export const metadata: Metadata = {
  title: "Tìm kiếm việc làm & công ty | JobConnect",
  description: "Tìm kiếm hàng ngàn việc làm và công ty hàng đầu tại JobConnect",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    cityId?: string;
    location?: string;
  }>;
}

async function getCities() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${API_URL}/cities`, { cache: "no-store" });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const cityId = params.cityId || "";
  const location = params.location || "";
  const type = (params.type === "company" ? "company" : "job") as "job" | "company";

  let jobs: Job[] = [];
  let companies: Company[] = [];
  let cities: { id: string; name: string }[] = [];
  let totalJobs = 0;
  let totalCompanies = 0;
  let allTags: string[] = [];

  try {
    // Fetch everything in parallel
    const [jobsRes, companiesRes, citiesData] = await Promise.all([
      jobService.getJobs({
        search: query,
        cityId: cityId,
        pageSize: 200,   // fetch large batch, paginate client-side
      }),
      companyService.getCompanies({
        search: type === "company" ? query : "",
        pageSize: 200,
      }),
      getCities(),
    ]);

    jobs = jobsRes.data;
    totalJobs = jobsRes.total;
    companies = companiesRes.data;
    totalCompanies = companiesRes.total;
    cities = citiesData;

    // Extract unique tag names from jobs for industry filter
    const tagSet = new Set<string>();
    jobs.forEach(job => job.tags.forEach(t => tagSet.add(t.name)));
    allTags = Array.from(tagSet).sort();
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#1d5b9a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Đang tải kết quả...</p>
          </div>
        </div>
      }
    >
      <SearchClient
        initialJobs={jobs}
        initialCompanies={companies}
        initialQuery={query}
        initialLocation={location}
        initialType={type}
        cities={cities}
        totalJobs={totalJobs}
        totalCompanies={totalCompanies}
        allTags={allTags}
      />
    </Suspense>
  );
}
