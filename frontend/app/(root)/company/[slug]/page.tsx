import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import CompanyBanner from "@/components/sections/company/CompanyBanner";
import CompanyInfo from "@/components/sections/company/CompanyInfo";
import CompanyOverview from "@/components/sections/company/CompanyOverview";
import CompanySkills from "@/components/sections/company/CompanySkills";
import CompanyBenefits from "@/components/sections/company/CompanyBenefits";
import CompanyPeople from "@/components/sections/company/CompanyPeople";
import JobList from "@/components/sections/company/JobList";
import CompanyPageSkeleton from "@/components/sections/company/CompanyPageSkeleton";
import { companyService } from "@/services/companyService";

// ─── Metadata ──────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const company = await companyService.getCompanyById(slug);
    return {
      title: `${company.name} - Company Profile`,
      description: company.description?.substring(0, 160) || `Learn more about ${company.name}`,
    };
  } catch {
    return {
      title: 'Company Not Found',
    };
  }
}

// ─── Page Content ──────────────────────────────────────────────────────────────
async function CompanyPageContent({ slug }: { slug: string }) {
  let company;
  
  try {
    company = await companyService.getCompanyById(slug);
  } catch (error) {
    console.error('Failed to fetch company:', error);
    notFound();
  }

  if (!company) {
    notFound();
  }

  // Transform data to match component props
  const companyData = {
    slug: company.id,
    name: company.name,
    logo: company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0ea5e9&color=fff&size=128&bold=true&rounded=true`,
    tagline: company.description?.split('.')[0] || `Join ${company.name}`,
    rating: 4.5, // Can add this to schema later
    reviews: company.jobs.length * 10, // Estimate based on jobs
    info: {
      companyType: company.type?.name || "Company",
      industry: "Technology",
      companySize: company.size || "Unknown",
      country: company.nation || "Vietnam",
      workingDays: "Monday – Friday",
      overtimePolicy: "Flexible",
    },
    overview: company.description ? [company.description] : [`${company.name} is a leading company in the industry.`],
    overviewBullets: [
      `${company.jobs.length} active job openings`,
      company.address ? `Located in ${company.address}` : '',
      company.websiteUrl ? 'Visit our website for more information' : '',
    ].filter(Boolean),
    skills: company.skills || [],
    benefits: [
      { 
        id: "competitive", 
        icon: "Trophy", 
        title: "Competitive Salary", 
        description: "Attractive compensation package with performance bonuses." 
      },
      { 
        id: "healthcare", 
        icon: "HeartPulse", 
        title: "Healthcare", 
        description: "Comprehensive health insurance for employees and family." 
      },
      { 
        id: "growth", 
        icon: "TrendingUp", 
        title: "Career Growth", 
        description: "Clear career path with training and development opportunities." 
      },
      { 
        id: "culture", 
        icon: "Users", 
        title: "Great Culture", 
        description: "Collaborative environment with work-life balance." 
      },
    ],
    images: [
      "https://picsum.photos/seed/office1/600/400",
      "https://picsum.photos/seed/team2/600/400",
      "https://picsum.photos/seed/work3/600/400",
      "https://picsum.photos/seed/event4/600/400",
    ],
  };

  // Transform jobs for JobList component
  const jobs = company.jobs.map(job => {
    // Format salary
    let salary = 'Negotiable';
    if (job.minSalary && job.maxSalary) {
      const formatSalary = (amount: number) => {
        if (job.currency === 'VND') {
          return `${(amount / 1000000).toFixed(0)}M`;
        }
        return `$${(amount / 1000).toFixed(1)}k`;
      };
      salary = `${formatSalary(job.minSalary)} – ${formatSalary(job.maxSalary)}`;
    }

    return {
      id: job.id,
      slug: job.id,
      title: job.title,
      company: company.name,
      companySlug: company.id,
      location: job.city.name,
      salary,
      tags: [...job.skills.map(s => s.name).slice(0, 3), ...job.tags.map(t => t.name).slice(0, 2)],
      benefits: job.tags.map(t => t.name),
      isHot: false,
    };
  });

  return (
    <div>
      <div className="pb-6 rounded-none">
        <CompanyBanner company={companyData} />
      </div>
      <div className="mx-auto max-w-7xl py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ── LEFT COLUMN (65%) ──────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <CompanyInfo info={companyData.info} />
            <CompanyOverview
              paragraphs={companyData.overview}
              bullets={companyData.overviewBullets}
            />
            <CompanySkills skills={companyData.skills} />
            <CompanyBenefits benefits={companyData.benefits} />
            <CompanyPeople images={companyData.images} companyName={companyData.name} />
          </div>

          {/* ── RIGHT COLUMN (35%) ─────────────────────────────────────────────── */}
          <div className="w-full shrink-0 lg:w-[360px] xl:w-[400px]">
            <JobList jobs={jobs} companyName={companyData.name} />
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
