"use client";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { TrendingTag } from "./TrendingTag";
import LocationSelect from "./LocationSelect";
import { useState, useRef, useEffect } from "react";
import { TrendingUp, Search, Briefcase, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

// ──────────────── Mock data ────────────────
const POPULAR_KEYWORDS = [
  "kế toán trưởng",
  "trưởng phòng kinh doanh",
  "trưởng phòng nhân sự",
  "nhân sự",
  "nhân viên marketing",
  "chuyên viên tuyển dụng",
  "lập trình viên php",
  "digital marketing",
  "data analyst",
  "sale admin",
];

const SUGGESTED_JOBS = [
  {
    id: 1,
    title: "Nhân Viên Kinh Doanh / Thị Trường – Không Kin...",
    company: "CÔNG TY TNHH CƠ KHÍ TÂN TÂN NGUYÊN VIỆT NAM",
    salary: "25 – 30 triệu",
    logo: "XY",
    color: "#f59e0b",
  },
  {
    id: 2,
    title: "Kỹ Sư Hệ Thống (System Engineer) – Lương Để...",
    company: "CÔNG TY TNHH TÍCH HỢP HỆ THỐNG NHT",
    salary: "Tới 25 triệu",
    logo: "NHT",
    color: "#3b82f6",
  },
  {
    id: 3,
    title: "Giáo Viên Bóng Đá Trẻ Em – Công Ty Nhật –...",
    company: "Công Ty TNHH Amitie Sports Club",
    salary: "10 – 20 triệu",
    logo: "AS",
    color: "#10b981",
  },
  {
    id: 4,
    title: "Nhân Viên Kinh Doanh Phát Triển Thị Trường...",
    company: "Công ty TNHH thép đặc biệt Phương Trang TMS",
    salary: "15 – 30 triệu",
    logo: "PT",
    color: "#ef4444",
  },
];

export function SearchBar() {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [searchType, setSearchType] = useState<"job" | "company">("job");
  const [location, setLocation] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (input.trim()) params.set("q", input.trim());
    params.set("type", searchType);
    if (location) params.set("location", location);
    router.push(`/searching-page?${params.toString()}`);
    setFocused(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter keywords by input
  const filteredKeywords = input
    ? POPULAR_KEYWORDS.filter((k) =>
        k.toLowerCase().includes(input.toLowerCase())
      )
    : POPULAR_KEYWORDS;

  const showDropdown = focused;

  return (
    <div className="bg-linear-to-r from-[#1d5b9a]  to-[#5ca8c1] to-90% flex flex-col items-center gap-8 py-15">
      <p className="text-3xl text-white font-bold text-center">
        Job Connect - Tạo CV bằng AI, Tìm Việc Làm, Tuyển dụng hiệu quả
      </p>

      {/* Search row with dropdown */}
      <div className="relative flex items-center gap-4 bg-transparent" ref={containerRef}>
        <LocationSelect label="Địa điểm" options={["Hà Nội", "Hải Phòng"]} />

        {/* Input + dropdown wrapper */}
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-12.5 w-100 rounded-full bg-white border-none px-6 text-[15px] font-semibold"
            placeholder={searchType === "company" ? "Tên công ty..." : "Vị trí tuyển dụng, tên công ty..."}
          />

          {/* ── Dropdown Panel ── */}
          {showDropdown && (
            <div
              className="absolute top-[calc(100%+8px)] left-0 z-50 w-[740px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              onMouseDown={(e) => e.preventDefault()} // prevent blur on click inside
            >
              {/* Search type selector */}
              <div className="flex items-center gap-6 px-5 pt-4 pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-500 font-medium">Tìm kiếm theo:</span>
                {(["job", "company"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      name="search_type"
                      checked={searchType === t}
                      onChange={() => setSearchType(t)}
                      className="accent-[#0E7BC3]"
                    />
                    {t === "job" ? "Tên việc làm" : "Tên công ty"}
                  </label>
                ))}
              </div>

              <div className="flex">
                {/* LEFT – Popular keywords */}
                <div className="w-[52%] px-5 py-4 border-r border-gray-100">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    <TrendingUp size={14} className="text-[#0E7BC3]" />
                    Từ khóa phổ biến
                  </p>
                  <ul className="space-y-0.5">
                    {filteredKeywords.slice(0, 8).map((kw) => (
                      <li key={kw}>
                        <button
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0E7BC3] transition-colors text-left group"
                          onClick={() => {
                            setInput(kw);
                            setFocused(false);
                          }}
                        >
                          <TrendingUp
                            size={14}
                            className="text-gray-400 group-hover:text-[#0E7BC3] shrink-0"
                          />
                          {kw}
                        </button>
                      </li>
                    ))}
                    {filteredKeywords.length === 0 && (
                      <li className="px-3 py-2 text-sm text-gray-400">
                        Không tìm thấy từ khóa phù hợp
                      </li>
                    )}
                  </ul>
                </div>

                {/* RIGHT – Suggested jobs */}
                <div className="w-[48%] px-5 py-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    <Briefcase size={14} className="text-[#0E7BC3]" />
                    Việc làm có thể bạn quan tâm
                  </p>
                  <ul className="space-y-3">
                    {SUGGESTED_JOBS.map((job) => (
                      <li key={job.id}>
                        <button
                          className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors text-left group"
                          onClick={() => {
                            setInput(job.title);
                            setFocused(false);
                          }}
                        >
                          {/* Company logo placeholder */}
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: job.color }}
                          >
                            {job.logo}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#0E7BC3] leading-tight">
                              {job.title}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {job.company}
                            </p>
                            <p className="text-[11px] font-semibold text-[#0E7BC3] mt-1 flex items-center gap-1">
                              <DollarSign size={10} />
                              {job.salary}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Search size={11} /> Nhấn Enter để tìm kiếm
                </span>
                <button
                  className="text-xs text-[#0E7BC3] font-semibold hover:underline"
                  onClick={() => setFocused(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSearch}
          className="h-12.5 px-10 rounded-full bg-[#1f698b] hover:bg-blue-900 text-white cursor-pointer font-semibold text-xl"
        >
          Tìm kiếm
        </Button>
      </div>

      <TrendingTag />
    </div>
  );
}
