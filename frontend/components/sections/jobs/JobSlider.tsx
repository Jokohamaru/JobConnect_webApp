"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import JobCard from "./JobCard";
import { Button } from "@/components/ui/button";

interface Job {
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
}

// 👉 chia page
function chunkArray(arr: Job[], size: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function JobSlider({ jobs }: { jobs: Job[] }) {
  const itemsPerPage = 9; // 👉 chỉnh tại đây

  const pages = chunkArray(jobs, itemsPerPage);

  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative w-full">
      {/* SLIDER */}
      <div className="overflow-hidden  pt-10  ">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] "
          style={{
            transform: `translateX(-${currentPage * 100}%)`,
          }}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              className="min-w-full grid grid-cols-3 gap-4 mt-4"
            >
              {page.map((job, i) => (
                <JobCard key={i} {...job} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* NAV */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft />
        </Button>

        <span>
          {currentPage + 1} / {pages.length}
        </span>

        <Button
          onClick={handleNext}
          disabled={currentPage === pages.length - 1}
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}