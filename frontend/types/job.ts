export interface Job {
  id: string;
  title: string;
  description: string;
  headcount: number;
  minSalary: number | null;
  maxSalary: number | null;
  currency: 'VND' | 'USD';
  status: string;
  companyId: string;
  recruiterId: string;
  cityId: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl: string | null;
    description?: string;
    size?: string;
  };
  city: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
  }>;
}

export interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JobFilters {
  page?: number;
  pageSize?: number;
  cityId?: string;
  cityName?: string;
  companyId?: string;
  minSalary?: number;
  maxSalary?: number;
  search?: string;
  tagNames?: string[];
}
