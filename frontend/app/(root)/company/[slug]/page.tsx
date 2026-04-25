import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCompanyBySlug, getJobsBySlug } from "@/lib/data/companies";
import CompanyBanner from "@/components/sections/company/CompanyBanner";
import CompanyInfo from "@/components/sections/company/CompanyInfo";
import CompanyOverview from "@/components/sections/company/CompanyOverview";
import CompanySkills from "@/components/sections/company/CompanySkills";
import CompanyBenefits from "@/components/sections/company/CompanyBenefits";
import CompanyPeople from "@/components/sections/company/CompanyPeople";
import JobList from "@/components/sections/company/JobList";
import CompanyPageSkeleton from "@/components/sections/company/CompanyPageSkeleton";

// ─── Metadata ──────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Page Content ──────────────────────────────────────────────────────────────
async function CompanyPageContent({ slug }: { slug: string }) {
  // Simulate async data fetch (replace with real API call later)
  await new Promise((resolve) => setTimeout(resolve, 0));

  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const jobs = getJobsBySlug(slug);

  return (
    <div>
      <div className="pb-6 rounded-none" >
        <CompanyBanner company={company} />
      </div>
      <div className="mx-auto max-w-7xl  py-8 ">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ── LEFT COLUMN (65%) ──────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <CompanyInfo info={company.info} />
            <CompanyOverview
              paragraphs={company.overview}
              bullets={company.overviewBullets}
            />
            <CompanySkills skills={company.skills} />
            <CompanyBenefits benefits={company.benefits} />
            <CompanyPeople images={company.images} companyName={company.name} />
          </div>

          {/* ── RIGHT COLUMN (35%) ─────────────────────────────────────────────── */}
          <div className="w-full shrink-0 lg:w-[360px] xl:w-[400px]">
            <JobList jobs={jobs} companyName={company.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <Suspense fallback={<CompanyPageSkeleton />}>
        <CompanyPageContent slug={slug} />
      </Suspense>
    </main>
  );
}
