import { get, post, del, patch } from '@/lib/api-client';

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  cv_id: string;
  status: 'APPLIED' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
  updated_at: string;
  job?: {
    id: string;
    title: string;
    company: {
      name: string;
      logo_url?: string;
    };
    location: string;
    salary_min: number;
    salary_max: number;
  };
  cv?: {
    file_name: string;
  };
}

export async function getMyApplications() {
  return get<Application[]>('/applications');
}

export async function getApplicationById(id: string) {
  return get<Application>(`/applications/${id}`);
}

export async function createApplication(jobId: string, cvId: string) {
  return post<Application>('/applications', {
    job_id: jobId,
    cv_id: cvId,
  });
}

export async function withdrawApplication(id: string) {
  return del(`/applications/${id}`);
}
