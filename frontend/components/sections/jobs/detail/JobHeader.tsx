import { Heart, MapPin, DollarSign, Building2, Clock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { JobDetail } from "@/lib/types/company";

interface JobHeaderProps {
  job: JobDetail;
}

export default function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {job.title}
            </h1>
            {job.isHot && (
              <Badge className="gap-1 bg-red-50 text-red-500 border-red-200 hover:bg-red-50">
                <Flame className="size-3" />
                Hot
              </Badge>
            )}
          </div>

          {/* Company link */}
          <a
            href={`/company/${job.companySlug}`}
            className="mt-1 inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium text-sm"
          >
            <Building2 className="size-4" />
            {job.company}
          </a>
        </div>

        {/* Heart icon */}
        <button
          aria-label="Save job"
          className="shrink-0 rounded-full border border-blue-300 p-2.5 text-blue-500 transition-colors hover:bg-blue-50 hover:border-blue-500"
        >
          <Heart className="size-5" />
        </button>
      </div>

      <Separator className="my-4" />

      {/* Salary + Location */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-green-600 font-semibold">
          <DollarSign className="size-4 shrink-0" />
          {job.salary}
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <MapPin className="size-4 shrink-0 text-gray-400" />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Clock className="size-4 shrink-0 text-gray-400" />
          Deadline: {job.deadline}
        </div>
      </div>

      {/* Apply button */}
      <div className="mt-5 flex gap-3">
        <Button
          id="btn-apply-now"
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-8 shadow-sm"
        >
          Apply Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold"
        >
          Save Job
        </Button>
      </div>

      {/* Posted */}
      <p className="mt-3 text-xs text-gray-400">Posted {job.postedAt}</p>
    </div>
  );
}
