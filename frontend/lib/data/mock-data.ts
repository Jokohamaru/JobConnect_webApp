export interface JobStats {
  total: number;
  pending: number;
  active: number;
  expired: number;
}

export const mockJobStats: JobStats = {
  total: 1250,
  pending: 145,
  active: 980,
  expired: 125,
};

export interface DashboardStats {
  totalJobs: string;
  newEmployers: string;
  newCandidates: string;
  expiredJobs: string;
}

export const mockDashboardStats: DashboardStats = {
  totalJobs: "4,953",
  newEmployers: "35",
  newCandidates: "1,234",
  expiredJobs: "100",
};

export interface TrendData {
  date: string;
  count: number;
}

export const mockTrendData: TrendData[] = [
  { date: "01/05", count: 40 },
  { date: "02/05", count: 55 },
  { date: "03/05", count: 45 },
  { date: "04/05", count: 70 },
  { date: "05/05", count: 65 },
  { date: "06/05", count: 85 },
  { date: "07/05", count: 80 },
  { date: "08/05", count: 100 },
  { date: "09/05", count: 90 },
  { date: "10/05", count: 120 },
  { date: "11/05", count: 110 },
  { date: "12/05", count: 140 },
  { date: "13/05", count: 130 },
  { date: "14/05", count: 160 },
];

export type JobStatus = "active" | "pending" | "expired";

export interface Job {
  id: string;
  title: string;
  employer: string;
  status: JobStatus;
  date: string;
}

export const mockJobs: Job[] = [
  {
    id: "JOB-001",
    title: "Senior Frontend Developer (React/Next.js)",
    employer: "TechCorp Vietnam",
    status: "active",
    date: "14/05/2026",
  },
  {
    id: "JOB-002",
    title: "Product Manager",
    employer: "Global Solutions",
    status: "pending",
    date: "13/05/2026",
  },
  {
    id: "JOB-003",
    title: "Backend Engineer (Node.js/NestJS)",
    employer: "InnovateTech",
    status: "active",
    date: "12/05/2026",
  },
  {
    id: "JOB-004",
    title: "UI/UX Designer",
    employer: "Creative Design Studio",
    status: "expired",
    date: "01/04/2026",
  },
  {
    id: "JOB-005",
    title: "DevOps Engineer",
    employer: "Cloud Systems Inc",
    status: "active",
    date: "10/05/2026",
  },
  {
    id: "JOB-006",
    title: "Marketing Specialist",
    employer: "Brand Builders",
    status: "pending",
    date: "14/05/2026",
  },
];
export interface Recruiter {
  id: string;
  companyName: string;
  representative: string;
  email: string;
  status: JobStatus;
  date: string;
}
export interface RecruiterStats {
  total: number;
  new: number;
  active: number;
  expired: number;
};
export const mockRecruiterStats: RecruiterStats = {
  total: 1000,
  new: 300,
  active: 300,
  expired: 50,
};
export const mockRecruiters: Recruiter[] = [
  {
    id: "RE-001",
    companyName: "TechCorp Vietnam",
    representative: "Mr. Nguyen Van A",
    email: "[EMAIL_ADDRESS]",
    status: "active",
    date: "14/05/2026",
  },
  {
    id: "RE-002",
    companyName: "Global Solutions",
    representative: "Ms. Nguyen Van B",
    email: "[EMAIL_ADDRESS]",
    status: "pending",
    date: "13/05/2026",
  },
  {
    id: "RE-003",
    companyName: "InnovateTech",
    representative: "Ms. Nguyen Van C",
    email: "[EMAIL_ADDRESS]",
    status: "active",
    date: "12/05/2026",
  },
  {
    id: "RE-004",
    companyName: "Creative Design Studio",
    representative: "Ms. Nguyen Van D",
    email: "[EMAIL_ADDRESS]",
    status: "expired",
    date: "01/04/2026",
  },
  {
    id: "RE-005",
    companyName: "Cloud Systems Inc",
    representative: "Mr. Nguyen Van E",
    email: "[EMAIL_ADDRESS]",
    status: "active",
    date: "10/05/2026",
  },
  {
    id: "RE-006",
    companyName: "Brand Builders",
    representative: "Mr. Nguyen Van F",
    email: "[EMAIL_ADDRESS]",
    status: "pending",
    date: "14/05/2026",
  },
];

export interface Candidate {
  id: string;
  name: string;
  expertise: string;
  status: JobStatus;
  date: string;
}
export interface CandidateStats {
  pending: number;
  new: number;
  star: number;
  newCV: number;
}
export const mockCandidateStats: CandidateStats = {
  pending: 1000,
  new: 35,
  star: 300,
  newCV: 50,
};

export const mockCandidates: Candidate[] = [
  {
    id: "E-001",
    name: "Mr. Nguyen Van A",
    expertise: "Software Engineer",
    status: "active",
    date: "14/05/2026",
  },
  {
    id: "E-002",
    name: "Ms. Nguyen Van B",
    expertise: "Product Manager",
    status: "pending",
    date: "13/05/2026",
  },
  {
    id: "E-003",
    name: "Ms. Nguyen Van C",
    expertise: "UI/UX Designer",
    status: "active",
    date: "12/05/2026",
  },
  {
    id: "E-004",
    name: "Ms. Nguyen Van D",
    expertise: "Data Analyst",
    status: "expired",
    date: "01/04/2026",
  },
  {
    id: "E-005",
    name: "Mr. Nguyen Van E",
    expertise: "Marketing Specialist",
    status: "active",
    date: "10/05/2026",
  },
  {
    id: "E-006",
    name: "Mr. Nguyen Van F",
    expertise: "Project Manager",
    status: "pending",
    date: "14/05/2026",
  },
];

export interface Categories {
  id: string;
  name: string;
  count: number;
}
export interface categoriesStats{
  total: number;
  hot: string;
  new: number;
  expired: number;
}
export const mockCategoriesStats: categoriesStats = {
  total: 1000,
  hot: "Marketing và Quảng cáo",
  new: 300,
  expired: 100,
};

export const mockCategories: Categories[] = [
  {
    id: "CAT-001",
    name: "Marketing và Quảng cáo",
    count: 1000,
  },
  {
    id: "CAT-002",
    name: "Công nghệ thông tin",
    count: 800,
  },
  {
    id: "CAT-003",
    name: "Kinh doanh",
    count: 500,
  },
  {
    id: "CAT-004",
    name: "Du lịch và Lữ hành",
    count: 400,
  },
  {
    id: "CAT-005",
    name: "Hành chính văn phòng",
    count: 300,
  },
  {
    id: "CAT-006",
    name: "Tài chính - Kế toán",
    count: 200,
  },
];