"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, Clock, Heart,
  SlidersHorizontal, Building2, TrendingUp, X,
} from "lucide-react";
import Link from "next/link";

// shadcn/ui
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

// ──────────────── Mock data ────────────────
const MOCK_JOBS = [
  { id: 1, title: "Fresher Software Developer - GlobeeX Talent Program", company: "Công Ty TNHH Dịch Vụ - Công Nghệ Globee", salary: "Từ 12 triệu", location: "Hồ Chí Minh", experience: "Dưới 1 năm", deadline: "30/06/2026", logo: "GB", color: "#1d4ed8", tags: ["Software Engineer", "IT - Phần mềm"], isHot: true, isNew: false },
  { id: 2, title: "Nhân Viên Chứng Từ Xuất Nhập Khẩu Hàng Nhập", company: "Công Ty TNHH NTL Group", salary: "9 - 12 triệu", location: "Hồ Chí Minh", experience: "1 - 3 năm", deadline: "15/06/2026", logo: "NTL", color: "#0ea5e9", tags: ["Xuất nhập khẩu", "Logistics"], isHot: false, isNew: true },
  { id: 3, title: "Kỹ Sư Cơ Điện Tử - Mechatronics Engineer", company: "Công Ty TNHH Bosch Việt Nam", salary: "20 - 35 triệu", location: "Hà Nội", experience: "2 - 5 năm", deadline: "20/07/2026", logo: "BS", color: "#dc2626", tags: ["Cơ khí", "Điện tử"], isHot: true, isNew: false },
  { id: 4, title: "Digital Marketing Executive", company: "Công Ty Cổ Phần Truyền Thông MediaZ", salary: "12 - 18 triệu", location: "Hà Nội", experience: "1 - 2 năm", deadline: "10/06/2026", logo: "MZ", color: "#7c3aed", tags: ["Marketing", "Digital"], isHot: false, isNew: false },
  { id: 5, title: "Nhân Viên Kinh Doanh B2B", company: "Tập Đoàn FPT", salary: "15 - 25 triệu", location: "Hà Nội", experience: "1 - 3 năm", deadline: "25/06/2026", logo: "FPT", color: "#f59e0b", tags: ["Kinh doanh", "B2B"], isHot: true, isNew: true },
  { id: 6, title: "Chuyên Viên Tuyển Dụng Senior", company: "Công Ty TNHH Manpower Việt Nam", salary: "18 - 28 triệu", location: "Hồ Chí Minh", experience: "3 - 5 năm", deadline: "30/07/2026", logo: "MP", color: "#059669", tags: ["Nhân sự", "Tuyển dụng"], isHot: false, isNew: false },
  { id: 7, title: "Lập Trình Viên PHP - Backend Developer", company: "Công Ty TNHH TMA Solutions", salary: "20 - 40 triệu", location: "Hồ Chí Minh", experience: "2 - 4 năm", deadline: "15/07/2026", logo: "TMA", color: "#0284c7", tags: ["IT - Phần mềm", "PHP", "Backend"], isHot: true, isNew: true },
  { id: 8, title: "Kế Toán Trưởng", company: "Công Ty Cổ Phần Vincom Retail", salary: "25 - 40 triệu", location: "Hà Nội", experience: "5+ năm", deadline: "20/06/2026", logo: "VC", color: "#be123c", tags: ["Kế toán", "Tài chính"], isHot: false, isNew: false },
  { id: 9, title: "Data Analyst - Phân Tích Dữ Liệu", company: "Công Ty TNHH Lazada Việt Nam", salary: "20 - 35 triệu", location: "Hồ Chí Minh", experience: "1 - 3 năm", deadline: "10/07/2026", logo: "LZ", color: "#ea580c", tags: ["IT", "Data", "Analytics"], isHot: true, isNew: false },
  { id: 10, title: "Nhân Viên Marketing Online", company: "Công Ty TNHH Shopee Việt Nam", salary: "10 - 15 triệu", location: "Hồ Chí Minh", experience: "Dưới 1 năm", deadline: "30/05/2026", logo: "SP", color: "#f97316", tags: ["Marketing", "E-commerce"], isHot: false, isNew: true },
  { id: 11, title: "Project Manager - IT", company: "Tập Đoàn Viettel", salary: "35 - 50 triệu", location: "Hà Nội", experience: "5+ năm", deadline: "15/08/2026", logo: "VT", color: "#1e40af", tags: ["IT", "Quản lý dự án"], isHot: true, isNew: false },
  { id: 12, title: "Trưởng Phòng Kinh Doanh", company: "Công Ty Cổ Phần Thế Giới Di Động", salary: "30 - 50 triệu", location: "Hồ Chí Minh", experience: "3 - 5 năm", deadline: "20/07/2026", logo: "TG", color: "#0369a1", tags: ["Kinh doanh", "Bán lẻ"], isHot: false, isNew: false },
];

const LOCATIONS = ["Tất cả", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];
const INDUSTRIES = ["Kế toán", "Marketing", "IT - Phần mềm", "Kinh doanh", "Nhân sự", "Logistics", "Tài chính - Ngân hàng"];
const POPULAR_KEYWORDS = ["kế toán trưởng", "lập trình viên", "nhân viên marketing", "chuyên viên tuyển dụng", "data analyst", "project manager", "digital marketing"];

// ──────────────── Main component ────────────────
export default function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get("q") || "";
  const typeParam = (searchParams.get("type") || "job") as "job" | "company";
  const locationParam = searchParams.get("location") || "";

  const [query, setQuery] = useState(queryParam);
  const [searchType, setSearchType] = useState<"job" | "company">(typeParam);
  const [location, setLocation] = useState(locationParam || "Tất cả");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("phu-hop-nhat");
  const [inputFocused, setInputFocused] = useState(false);
  const [filteredInput, setFilteredInput] = useState(queryParam);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter jobs
  const filtered = MOCK_JOBS.filter((job) => {
    const q = query.toLowerCase();
    const matchQuery =
      searchType === "company"
        ? job.company.toLowerCase().includes(q)
        : job.title.toLowerCase().includes(q);
    const matchLocation =
      !location || location === "Tất cả" || job.location === location;
    const matchIndustry =
      selectedIndustries.length === 0 ||
      job.tags.some((t) => selectedIndustries.includes(t));
    return (!q || matchQuery) && matchLocation && matchIndustry;
  });

  const sortedJobs = [...filtered].sort((a, b) =>
    sortBy === "moi-nhat" ? b.id - a.id : 0
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filteredInput) params.set("q", filteredInput);
    params.set("type", searchType);
    if (location && location !== "Tất cả") params.set("location", location);
    router.push(`/tim-kiem?${params.toString()}`);
    setQuery(filteredInput);
    setInputFocused(false);
  };

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = POPULAR_KEYWORDS.filter((k) =>
    !filteredInput || k.toLowerCase().includes(filteredInput.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F3F5F7]">

      {/* ── Top Search Bar ── */}
      <div className="bg-gradient-to-r from-[#1d5b9a] to-[#5ca8c1] py-4 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-3">

          {/* Keyword input + suggestions */}
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                value={filteredInput}
                onChange={(e) => setFilteredInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={
                  searchType === "company"
                    ? "Tên công ty..."
                    : "Vị trí tuyển dụng, tên công ty..."
                }
                className="px-4 py-6 rounded-full pl-9 pr-9 bg-white border-none shadow-sm text-[14px]"
              />
              {filteredInput && (
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setFilteredInput("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Suggestion dropdown */}
            {inputFocused && suggestions.length > 0 && (
              <div
                className="absolute top-[calc(100%+6px)] left-0 z-50 w-full bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
                onMouseDown={(e) => e.preventDefault()}
              >
                <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-4 pb-2">
                  <TrendingUp size={13} className="text-[#1d5b9a]" />
                  Từ khóa phổ biến
                </p>
                {suggestions.map((kw) => (
                  <button
                    key={kw}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent text-sm text-foreground text-left transition-colors"
                    onClick={() => {
                      setFilteredInput(kw);
                      setQuery(kw);
                      setInputFocused(false);
                    }}
                  >
                    <Search size={13} className="text-muted-foreground shrink-0" />
                    {kw}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Select */}
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="px-4 py-6 w-44 rounded-full bg-white border-none shadow-sm text-[14px]">
              <MapPin size={14} className="text-muted-foreground mr-1" />
              <SelectValue placeholder="Địa điểm" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search button */}
          <Button
            onClick={handleSearch}
            className="px-4 py-6 rounded-full bg-white text-[#1d5b9a] hover:bg-blue-50 font-bold text-[15px] shadow-sm border-none"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-60 shrink-0 space-y-4">

          {/* Search type filter */}
          <Card className="shadow-sm gap-0 py-0 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="px-5 pt-5 pb-0 border-b-0">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-[#1d5b9a]" />
                Tìm kiếm theo
              </p>
            </CardHeader>
            <CardContent className="px-4 py-4 space-y-1">
              {(["job", "company"] as const).map((t) => {
                const active = searchType === t;
                return (
                  <label
                    key={t}
                    className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl transition-colors text-sm font-medium select-none ${
                      active
                        ? "bg-blue-50 text-[#1d5b9a]"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="search_type_sidebar"
                      checked={active}
                      onChange={() => setSearchType(t)}
                      className="accent-[#1d5b9a]"
                    />
                    <span className="flex items-center gap-2">
                      {t === "job" ? (
                        <Briefcase size={14} />
                      ) : (
                        <Building2 size={14} />
                      )}
                      {t === "job" ? "Tên việc làm" : "Tên công ty"}
                    </span>
                  </label>
                );
              })}
            </CardContent>
          </Card>

          {/* Industry filter */}
          <Card className="shadow-sm gap-0 py-0 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="px-5 pt-5 pb-0 border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-[#1d5b9a]" />
                  Danh mục nghề
                </p>
                {selectedIndustries.length > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectedIndustries([])}
                    className="text-destructive hover:text-destructive h-auto p-0 text-xs font-medium"
                  >
                    Xóa lọc
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 py-4 space-y-1">
              {INDUSTRIES.map((ind) => {
                const checked = selectedIndustries.includes(ind);
                return (
                  <div
                    key={ind}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <Checkbox
                      id={`ind-${ind}`}
                      checked={checked}
                      onCheckedChange={() => toggleIndustry(ind)}
                      className="shrink-0"
                    />
                    <Label
                      htmlFor={`ind-${ind}`}
                      className={`text-sm cursor-pointer select-none w-full ${
                        checked ? "font-semibold text-[#1d5b9a]" : "text-muted-foreground"
                      }`}
                    >
                      {ind}
                    </Label>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <main className="flex-1 min-w-0">

          {/* Result header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {query
                  ? `Tuyển dụng "${query}"${location && location !== "Tất cả" ? ` tại ${location}` : ""}`
                  : "Tất cả việc làm"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Tìm thấy{" "}
                <span className="font-semibold text-[#1d5b9a]">
                  {sortedJobs.length}
                </span>{" "}
                việc làm phù hợp
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search type toggle pills */}
              <div className="flex items-center gap-1 bg-white rounded-full px-1 py-1 shadow-sm ">
                {(["job", "company"] as const).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={searchType === t ? "default" : "ghost"}
                    onClick={() => setSearchType(t)}
                    className={`rounded-full flex items-center gap-1.5 text-xs font-medium px-4 py-4 ${
                      searchType === t
                        ? "bg-[#1d5b9a] text-white hover:bg-[#1d5b9a]/90"
                        : ""
                    }`}
                  >
                    {t === "job" ? (
                      <Briefcase size={12} />
                    ) : (
                      <Building2 size={12} />
                    )}
                    {t === "job" ? "Tên việc làm" : "Tên công ty"}
                  </Button>
                ))}
              </div>

              {/* Sort select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 rounded-full px-4 py-4 border-none shadow-2xl bg-white text-sm">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phu-hop-nhat">Phù hợp nhất</SelectItem>
                  <SelectItem value="moi-nhat">Mới nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Job cards */}
          {sortedJobs.length === 0 ? (
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="py-16 text-center">
                <Search size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium text-lg">
                  Không tìm thấy việc làm phù hợp
                </p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  Thử tìm với từ khóa khác hoặc bỏ bớt bộ lọc
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedJobs.map((job) => (
                <JobResultCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ──────────────── Job Result Card ────────────────
function JobResultCard({ job }: { job: (typeof MOCK_JOBS)[number] }) {
  const [saved, setSaved] = useState(false);

  return (
    <Card className="rounded-2xl bg-white shadow-sm border border-transparent hover:border-blue-200 hover:shadow-md transition-all duration-200 py-0 gap-0 group">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Company logo */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: job.color }}
          >
            {job.logo}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Title + badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-bold text-foreground hover:text-[#1d5b9a] transition-colors text-[15px] leading-tight line-clamp-1 group-hover:text-[#1d5b9a]"
                  >
                    {job.title}
                  </Link>
                  {job.isHot && (
                    <Badge
                      className="bg-red-100 text-red-500 border-none text-[11px] font-bold rounded-full h-auto py-0.5 px-2"
                    >
                      🔥 HOT
                    </Badge>
                  )}
                  {job.isNew && (
                    <Badge
                      className="bg-green-100 text-green-600 border-none text-[11px] font-bold rounded-full h-auto py-0.5 px-2"
                    >
                      ✨ MỚI
                    </Badge>
                  )}
                </div>

                {/* Company */}
                <Link
                  href={`/company/${job.id}`}
                  className="text-sm text-muted-foreground hover:text-[#1d5b9a] mt-0.5 block truncate"
                >
                  {job.company}
                </Link>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[#1d5b9a] border-blue-200 bg-blue-50 rounded-full text-[11px] font-medium h-auto py-0.5 px-2.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="text-right shrink-0">
                <p className="text-emerald-600 font-bold text-sm whitespace-nowrap">
                  {job.salary}
                </p>
              </div>
            </div>

            {/* Footer */}
            <Separator className="mt-3 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#1d5b9a]" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} className="text-[#1d5b9a]" />
                  {job.experience}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground/60" />
                  HSD: {job.deadline}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSaved(!saved)}
                  className={`rounded-full transition-colors ${
                    saved
                      ? "border-red-400 text-red-400 bg-red-50"
                      : "hover:border-red-300 hover:text-red-400"
                  }`}
                >
                  <Heart size={13} fill={saved ? "currentColor" : "none"} />
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-[#1d5b9a] hover:bg-[#164879] text-white text-xs font-semibold px-4"
                >
                  <Link href={`/jobs/${job.id}`}>Ứng tuyển</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
