import { Company, CompaniesResponse, CompanyFilters } from '@/types/company';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const companyService = {
  async getCompanies(filters?: CompanyFilters): Promise<CompaniesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_URL}/companies?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }

    return response.json();
  },

  async getCompanyById(id: string): Promise<Company> {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company');
    }

    return response.json();
  },
};
