import Image from "next/image";
import { Star, Bell, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/types/company";

interface CompanyBannerProps {
  company: Company;
}

export default function CompanyBanner({ company }: CompanyBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#9358f7] via-[#6197ee] to-[#10d7e2] shadow-sm border border-gray-100">
      {/* Cover gradient strip */}
      <div className=" px-6 pb-6 w-full " />

      {/* Content area */}
      <div className="px-30 pb-6">
        {/* Logo – overlaps cover */}

        <div className="flex flex-col gap-3 ">
          {/* Left: name + rating */}
          <div className="flex  gap-5 items-center ">
            <div className="">
              <div className=" rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {company.name}
              </h1>
              <p className="text-sm text-white">{company.tagline}</p>
              <div className="flex items-center gap-2 shrink-0">
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
                  className="gap-1.5  px-6 py-5 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <PenLine className="size-4" />
                  Viết đánh giá
                </Button>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
        </div>
      </div>
    </div>
  );
}
