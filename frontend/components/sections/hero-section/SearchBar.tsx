"use client";

import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { TrendingTag } from "./TrendingTag";
import LocationSelect from "./LocationSelect";
import { useState, useRef, useEffect } from "react";
import { TrendingUp, Search, Briefcase, DollarSign, ArrowRight, User, Sparkles } from "lucide-react";
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
    <div className="bg-linear-to-b from-[#1864c0] to-[#71C5EE] flex flex-col items-center gap-6 py-12 px-4 relative">
      {/* Decorative background clouds (abstract) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 -left-20 w-64 h-24 bg-white/10 blur-3xl rounded-full" />
        <div className="absolute top-20 -right-20 w-80 h-32 bg-white/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-96 h-40 bg-white/20 blur-3xl rounded-full" />
      </div>

      <h1 className="text-[32px] text-white font-bold text-center leading-tight z-10">
        Job Connect - Tạo CV bằng AI,<br/>
        Tìm Việc Làm, Tuyển dụng hiệu quả
      </h1>

      {/* Unified Search Row */}
      <div className="relative flex items-center bg-white rounded-full p-1.5 w-full max-w-[800px] shadow-lg z-40" ref={containerRef}>
        
        {/* Location Dropdown */}
        <div className="shrink-0 w-40 z-50">
          <LocationSelect label="Địa điểm" options={["Hà Nội", "Hải Phòng", "Hồ Chí Minh", "Đà Nẵng"]} />
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1 shrink-0" />

        {/* Input area */}
        <div className="relative flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-12 w-full bg-transparent border-none px-4 text-[15px] text-gray-700 font-medium focus-visible:ring-0 shadow-none placeholder:text-gray-400"
            placeholder={searchType === "company" ? "Tên công ty..." : "Vị trí tuyển dụng, tên công ty..."}
          />

          {/* ── Dropdown Panel ── */}
          {showDropdown && (
            <div
              className="absolute top-[calc(100%+16px)] left-[-20px] z-50 w-[740px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
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

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="h-11 px-8 rounded-full bg-[#1877F2] hover:bg-blue-700 text-white cursor-pointer font-medium text-sm shrink-0 shadow-sm ml-1 transition-colors"
        >
          Tìm Kiếm
        </Button>
      </div>

      <div className="z-20">
        <TrendingTag />
      </div>

      {/* AI CV Creation Banner */}
      <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-[800px] w-full flex flex-col md:flex-row items-center justify-between shadow-2xl z-20">
        <div className="max-w-md">
          <h2 className="text-[22px] font-bold text-gray-900 mb-2 flex items-center gap-3">
            Tạo CV chuyên nghiệp bằng AI
            <span className="bg-[#4F46E5] text-white text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full shadow-sm">Mới</span>
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            CV tối ưu ATS, đẹp mắt, đúng chuẩn nhà tuyển dụng<br/>
            Chỉ mất 1 phút để sở hữu CV ấn tượng!
          </p>
          <Button onClick={() => router.push('/cv-builder/ai')} className="bg-[#4F46E5] hover:bg-indigo-600 text-white rounded-lg px-6 h-11 flex items-center gap-2 font-medium shadow-md transition-colors">
            <Sparkles size={16} /> Tạo CV ngay <ArrowRight size={16} />
          </Button>
        </div>

        {/* Abstract Illustration */}
        <div className="relative shrink-0 w-48 h-40 mt-8 md:mt-0 mr-4">
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-[120px] h-[150px] bg-white border-4 border-blue-50 rounded-xl shadow-xl relative p-3">
               {/* User icon */}
               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 mx-auto">
                 <User size={20} />
               </div>
               {/* Lines */}
               <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2"></div>
               <div className="w-3/4 h-1.5 bg-gray-100 rounded-full mb-4"></div>
               {/* Chart */}
               <div className="flex gap-1.5 items-end h-8">
                 <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                 <div className="w-3 h-5 bg-gray-300 rounded-sm"></div>
                 <div className="w-3 h-4 bg-blue-300 rounded-sm"></div>
                 <div className="w-3 h-8 bg-blue-500 rounded-sm"></div>
               </div>
               
               {/* AI Badge overlay */}
               <div className="absolute -left-5 bottom-4 bg-[#4F46E5] text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-200 border border-indigo-400">
                 AI
               </div>
             </div>
             {/* Sparkles */}
             <Sparkles className="absolute text-blue-300 w-5 h-5 -top-2 right-6 opacity-70" />
             <Sparkles className="absolute text-blue-400 w-4 h-4 bottom-4 -right-2 opacity-80" />
             <Sparkles className="absolute text-indigo-300 w-6 h-6 top-8 -left-6 opacity-60" />
           </div>
        </div>
      </div>
    </div>
  );
}
