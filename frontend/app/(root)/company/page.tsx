import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { companies } from "@/lib/data/companies";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";



export default function CompaniesPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Building2 className="size-7 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Top Companies</h1>
        </div>

        <div className="flex flex-col gap-4">
          {companies.map((company) => (
            <div
              key={company.slug}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 overflow-hidden rounded-xl border border-gray-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{company.name}</p>
                  <p className="text-sm text-gray-500">{company.tagline}</p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shrink-0"
              >
                <Link href={`/company/${company.slug}`}>
                  View <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
