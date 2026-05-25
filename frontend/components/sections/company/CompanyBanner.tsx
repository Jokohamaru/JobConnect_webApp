"use client";

import { Bell, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Company } from "@/lib/types/company";

interface CompanyBannerProps {
  company: Company;
}

export default function CompanyBanner({ company }: CompanyBannerProps) {
  const initials = company.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#9358f7] via-[#6197ee] to-[#10d7e2] shadow-sm border border-gray-100">
      {/* Content area */}
      <div className="px-10 py-6">
        <div className="flex flex-col gap-3">
          {/* Logo + name row */}
          <div className="flex gap-5 items-center">
            {/* Logo container – fixed 96×96 with initials fallback */}
            <div className="w-24 h-24 shrink-0 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white relative">
              {/* Initials fallback layer (always rendered behind) */}
              <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br from-[#6197ee] to-[#10d7e2] select-none z-0">
                {initials}
              </span>
              {/* Real logo on top */}
              {company.logo && (
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="absolute inset-0 w-full h-full object-contain z-10 bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            {/* Name + tagline + buttons */}
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-sm text-white/90 line-clamp-1">{company.tagline}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 px-6 py-5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Bell className="size-4" />
                  Theo dõi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 px-6 py-5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <PenLine className="size-4" />
                  Viết đánh giá
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

