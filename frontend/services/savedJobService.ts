const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SavedJob {
  id: string;
  candidateId: string;
  jobId: string;
  savedAt: string;
  job: {
    id: string;
    title: string;
    description: string;
    minSalary: number | null;
    maxSalary: number | null;
    currency: string;
    company: {
      id: string;
      name: string;
      logoUrl: string | null;
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
  };
}

export const savedJobService = {
  async saveJob(jobId: string, token: string): Promise<SavedJob> {
    const response = await fetch(`${API_URL}/saved-jobs/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Failed to save job');
    }

    return response.json();
  },

  async unsaveJob(jobId: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Failed to unsave job');
    }
  },

  async getMySavedJobs(token: string): Promise<SavedJob[]> {
    const response = await fetch(`${API_URL}/saved-jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved jobs');
    }

    return response.json();
  },

  async checkIfSaved(jobId: string, token: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/saved-jobs/check/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.saved;
  },
};
