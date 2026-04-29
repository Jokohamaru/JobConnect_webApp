import { get, post } from '@/lib/api-client';

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  status: string;
  created_at: string;
  company: {
    id: string;
    name: string;
    logo_url?: string;
  };
  skills?: Array<{
    skill: {
      name: string;
    };
  }>;
  tags?: Array<{
    tag: {
      name: string;
    };
  }>;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface JobFilters {
  search?: string;
  location?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  page?: number;
  limit?: number;
}

export async function getJobs(filters?: JobFilters) {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.job_type) params.append('job_type', filters.job_type);
  if (filters?.salary_min) params.append('salary_min', filters.salary_min.toString());
  if (filters?.salary_max) params.append('salary_max', filters.salary_max.toString());
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
  
  return get<Job[]>(endpoint, { skipAuth: true });
}

export async function getJobById(id: string) {
  return get<Job>(`/jobs/${id}`, { skipAuth: true });
}

export async function applyToJob(jobId: string, cvId: string) {
  return post('/applications', {
    job_id: jobId,
    cv_id: cvId,
  });
}
