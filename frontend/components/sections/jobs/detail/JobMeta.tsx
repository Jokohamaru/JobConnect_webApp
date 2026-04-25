import { Briefcase, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { JobDetail } from "@/lib/types/company";

interface JobMetaProps {
  job: JobDetail;
}

export default function JobMeta({ job }: JobMetaProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Job Overview
      </h2>
      <Separator className="mb-5" />

      <div className="flex flex-col gap-5">
        {/* Skills */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Skills & Technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-lg border-blue-200 bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Meta info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Briefcase className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Experience
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {job.experience}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Globe className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Domain
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {job.domain}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
