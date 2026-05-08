import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { jobService } from "@/services/jobService";

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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/cities`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return [];
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const cityId = params.cityId || '';
  const location = params.location || '';

  let jobs = [];
  let cities = [];

  try {
    // Fetch jobs and cities in parallel
    [jobs, cities] = await Promise.all([
      jobService.getJobs({
        search: query,
        cityId: cityId,
        pageSize: 100,
      }).then(res => res.data),
      getCities(),
    ]);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3F5F7] flex items-center justify-center">
        <p>Đang tải...</p>
      </div>
    }>
      <SearchClient 
        initialJobs={jobs}
        initialQuery={query}
        initialLocation={location}
        cities={cities}
      />
    </Suspense>
  );
}
