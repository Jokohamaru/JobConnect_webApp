import Link from "next/link";
import {
  Star,
  Building2,
  Layers,
  Users,
  Globe,
  CalendarDays,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Company } from "@/lib/types/company";

interface CompanyInfoCardProps {
  company: Company;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const rows = [
    { icon: Building2,    label: "Company type",   value: company.info.companyType },
    { icon: Layers,       label: "Industry",        value: company.info.industry },
    { icon: Users,        label: "Company size",    value: company.info.companySize },
    { icon: Globe,        label: "Country",         value: company.info.country },
    { icon: CalendarDays, label: "Working days",    value: company.info.workingDays },
    { icon: Clock,        label: "Overtime policy", value: company.info.overtimePolicy },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      {/* Logo + name */}
      <div className="flex flex-col items-center text-center gap-3 pb-4">
        <img
          src={company.logo}
          alt={company.name}
          className="size-16 rounded-xl object-cover shadow-sm"
        />
        <div>
          <Link
            href={`/company/${company.slug}`}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {company.name}
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">{company.tagline}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-4 ${
                i < Math.floor(company.rating)
                  ? "fill-amber-400 text-amber-400"
                  : i < company.rating
                  ? "fill-amber-200 text-amber-400"
                  : "fill-gray-100 text-gray-300"
              }`}
            />
          ))}
          <span className="text-base font-semibold text-gray-700 ml-1">
            {company.rating.toFixed(1)}
          </span>
          <span className="text-base text-gray-400">
            ({company.reviews} reviews)
          </span>
        </div>
      </div>

      <Separator className="mb-4" />
          
      {/* Info rows */}
      <div className="flex flex-col gap-3.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Icon className="size-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-gray-400 uppercase tracking-wide font-medium">
                {label}
              </p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {/* View company button */}
      <Link href={`/company/${company.slug}`} className="block">
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 border-blue-200 text-white bg-blue-500 hover:bg-[#0E7BC3] font-semibold"
        >
          View Company Profile
          <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
