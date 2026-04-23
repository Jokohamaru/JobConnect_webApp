import { BriefcaseBusiness } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Job } from "@/lib/types/company";
import JobCard from "@/components/sections/company/JobCard";

interface JobListProps {
  jobs: Job[];
  companyName: string;
}

export default function JobList({ jobs, companyName }: JobListProps) {
  return (
    <aside className="sticky top-24 flex flex-col gap-4 rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="size-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900">
              Jobs at {companyName}
            </h2>
          </div>
          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {jobs.length}
          </span>
        </div>
        <Separator className="mt-3" />
      </div>

      {/* Job cards */}
      {jobs.length === 0 ? (
        <div className="py-10 text-center">
          <BriefcaseBusiness className="mx-auto mb-2 size-10 text-gray-200" />
          <p className="text-sm text-gray-400">No open positions right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </aside>
  );
}
