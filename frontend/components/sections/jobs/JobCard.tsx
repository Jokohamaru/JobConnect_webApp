
"use client";

import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import JobDetailHover from "./JobDetailHover";
import { Heart } from 'lucide-react';
export interface JobCardProps {
  nameJob: string;
  nameCompany: string;
  logoCompanyURL: string;
  salary: string;
  locate: string;
  deadline: string;
  experience: string,
  descriptions: string[];
  requests: string[];
  benefits: string[];
  address: string[];
}

export default function JobCard({
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
  experience
}: JobCardProps) {
  const [hover, setHover] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<"left" | "right">("right");
  const handleHover = () => {
    setHover(true);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;

      if (spaceRight < 520) {
        setPosition("left");
      } else {
        setPosition("right");
      }
    }
  };
  return (
    <div ref={cardRef} className="relative w-[440px] py-1 ">
      {/* CARD */}
      <div className="bg-white rounded-xl shadow px-1 py-4">
        <div className="flex gap-2 items-center justify-center">
          <div className="w-[60px] h-[60px]">
            <img
              src={logoCompanyURL || "https://i.pravatar.cc/40"}
              alt={nameCompany}
              className="w-full h-full rounded"
            />
          </div>
          <div className="flex flex-col w-[70%]">
            {/* Hover trigger */}
            <p
              className="font-bold text-center cursor-pointer hover:text-blue-600 transition-colors  line-clamp-2"
              onMouseEnter={handleHover}
              onMouseLeave={() => setHover(false)}
            >
              {nameJob}
            </p>
            <p className="text-[12px] text-[#5E70AB] text-center">
              {nameCompany}
            </p>
          </div>
        </div>
        <div className="flex items-center px-5 pt-4 justify-between">
          <div className="flex  gap-3">
            <Button className="px-3 py-3 bg-[#9BDBFB] rounded-2xl text-sm">
              {salary}
            </Button>
            <Button className="px-3 py-3 bg-[#9BDBFB] rounded-2xl text-sm">
              {locate}
            </Button>

          </div>
          <div className="p-2 rounded-full border border-[#1B84B7]">
            <Heart className="text-[#1B84B7]" />
          </div>
        </div>
      </div>

      {/* HOVER PANEL - Component riêng */}
      {hover && (
        <JobDetailHover
          nameJob={nameJob}
          nameCompany={nameCompany}
          logoCompanyURL={logoCompanyURL}
          salary={salary}
          locate={locate}
          deadline={deadline}
          descriptions={descriptions}
          requests={requests}
          benefits={benefits}
          address={address}
          onMouseEnter={handleHover}
          onMouseLeave={() => setHover(false)} position={position} experience={experience}        />
      )}
    </div>
  );
}
