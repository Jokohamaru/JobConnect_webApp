import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { companyService } from "@/services/companyService";

export const metadata: Metadata = {
  title: "Top Companies",
  description: "Explore top companies and their job opportunities",
};

export default async function CompaniesPage() {
  let companies = [];
  
  try {
    const response = await companyService.getCompanies({ pageSize: 50 });
    companies = response.data;
  } catch (error) {
    console.error('Failed to fetch companies:', error);
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Building2 className="size-7 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Top Companies</h1>
          <span className="text-sm text-gray-500">({companies.length} companies)</span>
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="size-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No companies found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 overflow-hidden rounded-xl border border-gray-100 bg-white flex items-center justify-center">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm">
                        {company.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-500">
                      {company.description?.substring(0, 60) || 'Join our team'}
                      {company.description && company.description.length > 60 ? '...' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shrink-0"
                >
                  <Link href={`/company/${company.id}`}>
                    View <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
