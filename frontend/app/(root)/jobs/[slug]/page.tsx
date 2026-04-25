import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getJobDetailBySlug, getCompanyBySlug } from "@/lib/data/companies";
import JobHeader from "@/components/sections/jobs/detail/JobHeader";
import JobMeta from "@/components/sections/jobs/detail/JobMeta";
import JobReasons from "@/components/sections/jobs/detail/JobReasons";
import JobDescription from "@/components/sections/jobs/detail/JobDescription";
import JobRequirements from "@/components/sections/jobs/detail/JobRequirements";
import JobBenefits from "@/components/sections/jobs/detail/JobBenefits";
import CompanyInfoCard from "@/components/sections/jobs/detail/CompanyInfoCard";

// ─── Metadata ──────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const job = getJobDetailBySlug(slug);
  if (!job) notFound();

  const company = getCompanyBySlug(job.companySlug);
  if (!company) notFound();

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-7xl text-xs text-gray-400 flex items-center gap-2">
          <a href="/" className="hover:text-blue-600 transition-colors">
            Home
          </a>
          <span>/</span>
          <a href="/jobs" className="hover:text-blue-600 transition-colors">
            Jobs
          </a>
          <span>/</span>
          <span className="text-gray-700 font-medium">{job.title}</span>
        </div>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl  py-8   ">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ── LEFT COLUMN ──────────────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <JobHeader job={job} />
            <JobMeta job={job} />
            <JobReasons reasons={job.reasons} />
            <JobDescription
              description={job.description}
              descriptionBullets={job.descriptionBullets}
            />
            <JobRequirements requirements={job.requirements} />
            <JobBenefits detailBenefits={job.detailBenefits} />
          </div>

          {/* ── RIGHT COLUMN (sticky sidebar) ────────────────────────────────────── */}
          <div className="w-full shrink-0 lg:w-[340px] xl:w-[380px]">
            <div className="sticky top-6">
              <CompanyInfoCard company={company} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
