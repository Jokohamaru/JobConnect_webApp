// ─── Company Info ──────────────────────────────────────────────────────────────
export interface CompanyInfoItem {
  label: string;
  value: string;
  icon: string; // lucide icon name
}

export interface CompanyInfoData {
  companyType: string;
  industry: string;
  companySize: string;
  country: string;
  workingDays: string;
  overtimePolicy: string;
}

// ─── Benefit ───────────────────────────────────────────────────────────────────
export interface Benefit {
  id: string;
  icon: string; // lucide icon name
  title: string;
  description: string;
}

// ─── Company ───────────────────────────────────────────────────────────────────
export interface Company {
  slug: string;
  name: string;
  logo: string;
  tagline: string;
  rating: number;      // 1–5
  reviews: number;
  info: CompanyInfoData;
  overview: string[];  // array of paragraphs
  overviewBullets: string[];
  skills: string[];
  benefits: Benefit[];
  images: string[];    // URLs
}

// ─── Job ───────────────────────────────────────────────────────────────────────
export interface Job {
  id: string;
  slug: string;          // dùng để điều hướng /jobs/[slug]
  title: string;
  company: string;
  companySlug: string;   // dùng để điều hướng /company/[slug]
  location: string;
  salary: string;
  tags: string[];
  benefits: string[];
  isHot?: boolean;
}

// ─── Job Detail ────────────────────────────────────────────────────────────────
export interface JobDetailBenefits {
  salary: string;
  insurance: string;
  environment: string;
  growth: string;
}

export interface JobDetail extends Job {
  experience: string;          // e.g. "3+ years"
  domain: string;              // e.g. "Fintech / E-commerce"
  postedAt: string;            // e.g. "2 days ago"
  deadline: string;            // e.g. "30/05/2026"
  reasons: string[];           // Top reasons to join us
  description: string[];       // Mô tả công việc (paragraphs)
  descriptionBullets: string[];// Bullet points trong mô tả
  requirements: string[];      // Yêu cầu kỹ năng & kinh nghiệm
  detailBenefits: JobDetailBenefits;
}
