import { Job, JobsResponse, JobFilters } from '@/types/job';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const jobService = {
  async getJobs(filters?: JobFilters): Promise<JobsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.minSalary) params.append('minSalary', filters.minSalary.toString());
    if (filters?.maxSalary) params.append('maxSalary', filters.maxSalary.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_URL}/jobs?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  },

  async getJobById(id: string): Promise<Job> {
    const response = await fetch(`${API_URL}/jobs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    return response.json();
  },
};
