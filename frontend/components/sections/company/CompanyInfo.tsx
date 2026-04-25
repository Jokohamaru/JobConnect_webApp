import {
  Building2,
  Layers,
  Users,
  Globe,
  CalendarDays,
  Clock,
  LucideIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { CompanyInfoData } from "@/lib/types/company";

interface CompanyInfoProps {
  info: CompanyInfoData;
}

interface InfoRow {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function CompanyInfo({ info }: CompanyInfoProps) {
  const rows: InfoRow[] = [
    { icon: Building2, label: "Company type", value: info.companyType },
    { icon: Layers, label: "Industry", value: info.industry },
    { icon: Users, label: "Company size", value: info.companySize },
    { icon: Globe, label: "Country", value: info.country },
    { icon: CalendarDays, label: "Working days", value: info.workingDays },
    { icon: Clock, label: "Overtime policy", value: info.overtimePolicy },
  ];

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        General Information
      </h2>
      <Separator className="mb-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Icon className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
