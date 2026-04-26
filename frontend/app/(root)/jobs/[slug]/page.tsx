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
