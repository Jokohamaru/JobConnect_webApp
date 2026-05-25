import { Job } from './job';

export interface Company {
  id: string;
  name: string;
  size: string | null;
  nation: string | null;
  description: string | null;
  address: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  typeId: string | null;
  createdAt: string;
  updatedAt: string;
  type: {
    id: string;
    name: string;
  } | null;
  jobs: Job[];
  skills: string[];
  _count?: {
    jobs: number;
  };
}

export interface CompaniesResponse {
  data: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CompanyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}
