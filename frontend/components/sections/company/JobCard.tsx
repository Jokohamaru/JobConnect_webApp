import Link from "next/link";
import { MapPin, DollarSign, Flame, ArrowRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/types/company";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <article className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      {/* Hot badge */}
      {job.isHot && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-500">
          <Flame className="size-3" />
          Hot
        </span>
      )}

      {/* Job title – click to detail page */}
      <Link
        href={`/jobs/${job.slug}`}
        className="group/title block pr-12"
      >
        <h3 className="text-base font-semibold text-gray-900 leading-snug group-hover/title:text-blue-700 transition-colors">
          {job.title}
        </h3>
      </Link>

      {/* Company name link */}
      <Link
        href={`/company/${job.companySlug}`}
        className="mt-1 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 hover:underline transition-colors"
      >
        <Building2 className="size-3 shrink-0" />
        {job.company}
      </Link>

      {/* Location + salary */}
      <div className="mt-1.5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="size-3.5 shrink-0 text-gray-400" />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
          <DollarSign className="size-3.5 shrink-0" />
          {job.salary}
        </div>
      </div>

      {/* Tech tags */}
      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="h-auto rounded-md border-gray-200 bg-gray-50 px-2 py-0.5 text-sm text-gray-600"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Benefit pills */}
      {job.benefits.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {job.benefits.map((benefit) => (
            <span
              key={benefit}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
            >
              {benefit}
            </span>
          ))}
        </div>
      )}

      {/* Apply button → navigate to job detail */}
      <div className="mt-4">
        <Link href={`/jobs/${job.slug}`} className="block">
          <Button
            size="lg"
            className="w-full gap-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold"
          >
            Apply Now
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
