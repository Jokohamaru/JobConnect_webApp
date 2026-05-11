import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JobHeader from "@/components/sections/jobs/detail/JobHeader";
import JobMeta from "@/components/sections/jobs/detail/JobMeta";
import JobReasons from "@/components/sections/jobs/detail/JobReasons";
import JobDescription from "@/components/sections/jobs/detail/JobDescription";
import JobRequirements from "@/components/sections/jobs/detail/JobRequirements";
import JobBenefits from "@/components/sections/jobs/detail/JobBenefits";
import CompanyInfoCard from "@/components/sections/jobs/detail/CompanyInfoCard";
import { jobService } from "@/services/jobService";

// ─── Metadata ──────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const job = await jobService.getJobById(slug);
    return {
      title: `${job.title} - ${job.company.name}`,
      description: job.description.substring(0, 160),
    };
  } catch {
    return {
      title: 'Job Not Found',
    };
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function JobDetailPage({ params }: PageProps) {
  const { slug: jobId } = await params;

  const job = await jobService.getJobById(jobId).catch((error) => {
    console.error('Failed to fetch job:', error);
    return null;
  });

  if (!job) {
    notFound();
  }

  // Transform data to match component props
  const jobDetail = {
    id: job.id,
    slug: job.id,
    title: job.title,
    company: job.company.name,
    companySlug: job.company.id,
    location: job.city.name,
    salary: formatSalary(job.minSalary, job.maxSalary, job.currency),
    tags: [...job.skills.map(s => s.name), ...job.tags.map(t => t.name)],
    benefits: job.tags.map(t => t.name),
    isHot: true, // You can add this field to schema later
    experience: "2+ years", // You can add this field to schema later
    domain: "Technology",
    postedAt: formatPostedDate(job.createdAt),
    deadline: formatDeadline(job.createdAt),
    reasons: [
      `Join ${job.company.name} and work on exciting projects`,
      `Competitive salary: ${formatSalary(job.minSalary, job.maxSalary, job.currency)}`,
      `Work in ${job.city.name}`,
      `${job.headcount} position${job.headcount > 1 ? 's' : ''} available`,
    ],
    description: [job.description],
    descriptionBullets: job.skills.map(skill => `Work with ${skill.name}`),
    requirements: job.skills.map(skill => `Experience with ${skill.name}`),
    detailBenefits: {
      salary: `Salary: ${formatSalary(job.minSalary, job.maxSalary, job.currency)}`,
      insurance: "Health insurance and benefits package",
      environment: `Modern office in ${job.city.name}`,
      growth: "Career development opportunities",
    },
  };

  const company = {
    slug: job.company.id,
    name: job.company.name,
    logo: job.company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company.name)}&background=0ea5e9&color=fff&size=128&bold=true&rounded=true`,
    tagline: job.company.description || "Join our team",
    rating: 4.5,
    reviews: 100,
    info: {
      companyType: "Company",
      industry: "Technology",
      companySize: job.company.size || "Unknown",
      country: "Vietnam",
      workingDays: "Monday – Friday",
      overtimePolicy: "Flexible",
    },
    overview: [job.company.description || ""],
    overviewBullets: [],
    skills: job.skills.map(s => s.name),
    benefits: [],
    images: [],
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-7xl text-xs text-gray-400 flex items-center gap-2">
          <a href="/" className="hover:text-blue-600 transition-colors">
            Home
          </a>
          <span>/</span>
          <a href="/tim-kiem" className="hover:text-blue-600 transition-colors">
            Jobs
          </a>
          <span>/</span>
          <span className="text-gray-700 font-medium">{job.title}</span>
        </div>
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ── LEFT COLUMN ──────────────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">              <JobHeader job={jobDetail} />
            <JobMeta job={jobDetail} />
            <JobReasons reasons={jobDetail.reasons} />
            <JobDescription
              description={jobDetail.description}
              descriptionBullets={jobDetail.descriptionBullets}
            />
            <JobRequirements requirements={jobDetail.requirements} />
            <JobBenefits detailBenefits={jobDetail.detailBenefits} />
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

// Helper functions
function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return "Negotiable";
  
  const format = (amount: number) => {
    if (currency === 'VND') {
      return `${(amount / 1000000).toFixed(0)}M VND`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (min && max) {
    return `${format(min)} – ${format(max)}`;
  } else if (min) {
    return `From ${format(min)}`;
  } else if (max) {
    return `Up to ${format(max)}`;
  }
  return "Negotiable";
}

function formatPostedDate(createdAt: string): string {
  const now = new Date();
  const posted = new Date(createdAt);
  const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function formatDeadline(createdAt: string): string {
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + 30); // 30 days from posting
  return deadline.toLocaleDateString('en-GB');
}
