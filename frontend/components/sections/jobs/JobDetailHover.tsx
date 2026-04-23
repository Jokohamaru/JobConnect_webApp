import { Button } from "@/components/ui/button";
import { MapPinned, BriefcaseBusiness } from 'lucide-react';
import { Hourglass } from 'lucide-react';
import Link from "next/link";
interface JobDetailHoverProps {
  slugJob: string;
  slugCompany: string;
  nameJob: string;
  nameCompany: string;
  logoCompanyURL: string;
  salary: string;
  locate: string;
  deadline: string;
  experience: string;
  descriptions: string[];
  requests: string[];
  benefits: string[];
  address: string[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  position: "left" | "right";
}

export default function JobDetailHover({
  slugJob,
  slugCompany,
  nameJob,
  nameCompany,
  logoCompanyURL,
  salary,
  locate,
  deadline,
  descriptions,
  requests,
  benefits,
  address,
  onMouseEnter,
  onMouseLeave,
  position,
  experience,
}: JobDetailHoverProps) {
  return (
    <div
      className={`absolute -top-15 ${
        position === "right" ? "left-[88%] ml-4" : "right-[70%] mr-4"
      } w-[500px] bg-white rounded-xl shadow-xl p-4 z-60`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* CONTENT SCROLL */}
      <div className="max-h-[550px] overflow-y-auto">
        {/* Header */}
        <div className="bg-white">
          <div className="flex gap-4">
            <div className="w-[80px] h-[80px]">
              <img
                src={logoCompanyURL || "https://i.pravatar.cc/40"}
                alt={nameCompany}
                className="w-full h-full rounded"
              />
            </div>
            <div className="flex flex-col  w-[70%]">
              <Link
                href={`/jobs/${slugJob}`}
                className="font-bold text-[20px] hover:text-blue-600 transition-colors"
              >
                {nameJob}
              </Link>
              <Link
                href={`/company/${slugCompany}`}
                className="text-[12px] text-[#5E70AB] hover:underline"
              >
                {nameCompany}
              </Link>
              <p className="text-[#32729A] font-bold">{salary}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex py-2 gap-3 flex-wrap">
            <Button className="px-3 py-3 bg-[#9BDBFB]  text-sm flex items-center">
              <MapPinned />{locate}
            </Button>
            <Button className="px-3 py-3 bg-[#9BDBFB]  text-sm flex items-center">
              <BriefcaseBusiness />{experience}
            </Button>
            <Button className="px-3 py-3 bg-[#9BDBFB]  text-sm flex items-center">
             <Hourglass/>  {deadline}
            </Button>
          </div>
        </div>

        {/* Mô tả công việc */}
        <div className="mb-4">
          <h4 className="text-[20px] font-semibold mb-2 px-2 border-l-4 border-blue-400">
            Mô tả công việc
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {descriptions.map((d, index) => (
              <li key={index}>{d}</li>
            ))}
          </ul>
        </div>

        {/* Yêu cầu ứng viên */}
        <div className="mb-4">
          <h4 className="text-[20px] font-semibold mb-2 px-2 border-l-4 border-blue-400">
            Yêu cầu ứng viên
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {requests.map((r, index) => (
              <li key={index}>{r}</li>
            ))}
          </ul>
        </div>

        {/* Quyền lợi */}
        <div className="mb-4">
          <h4 className="text-[20px] font-semibold mb-2 px-2 border-l-4 border-blue-400">
            Quyền lợi
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {benefits.map((b, index) => (
              <li key={index}>{b}</li>
            ))}
          </ul>
        </div>

        {/* Địa điểm làm việc */}
        <div className="mb-4">
          <h4 className="text-[20px] font-semibold mb-2 px-2 border-l-4 border-blue-400">
            Địa điểm làm việc
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            {address.map((a, index) => (
              <li key={index}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
