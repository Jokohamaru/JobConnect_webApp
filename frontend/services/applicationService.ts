const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateApplicationRequest {
  jobId: string;
  cvId: string;
}

export interface Application {
  id: string;
  status: string;
  jobId: string;
  cvId: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
      logoUrl: string | null;
    };
    city: {
      id: string;
      name: string;
    };
  };
  cv: {
    id: string;
    title: string;
  };
}

export const applicationService = {
  async applyToJob(data: CreateApplicationRequest, token: string): Promise<Application> {
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Failed to apply to job');
    }

    return response.json();
  },

  async getMyApplications(token: string): Promise<Application[]> {
    const response = await fetch(`${API_URL}/applications/my-applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }

    return response.json();
  },

  async checkIfApplied(jobId: string, token: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/applications/check/${jobId}`, {
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
    return data.applied;
  },

  async getApplicationsByJob(jobId: string, token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/applications/job/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch applications for job');
    }

    return response.json();
  },

  async matchApplication(applicationId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/applications/${applicationId}/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Failed to match candidate CV');
    }

    return response.json();
  },

  async getApplicationById(applicationId: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Failed to fetch application (${response.status}): ${body}`);
    }

    return response.json();
  },
};
