"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, MapPin, Briefcase, Clock, Heart,
  SlidersHorizontal, Building2, TrendingUp, X, ChevronLeft, ChevronRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getCompanyLogoUrl } from "@/utils/avatarHelper";

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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Job } from "@/types/job";
import { Company } from "@/types/company";

const ITEMS_PER_PAGE = 8;

const POPULAR_KEYWORDS = [
  "frontend", "backend", "fullstack", "marketing",
  "data analyst", "project manager", "designer", "nhân sự",
];

// Industry filter categories mapped to common tag/skill keywords
const INDUSTRY_FILTERS = [
  { label: "IT - Phần mềm", keywords: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "PHP"] },
  { label: "Marketing", keywords: ["Marketing", "SEO", "Content", "Digital"] },
  { label: "Kế toán - Tài chính", keywords: ["Kế toán", "Tài chính", "Ngân hàng", "Kế toán trưởng"] },
  { label: "Kinh doanh", keywords: ["Kinh doanh", "Sales", "Bán hàng"] },
  { label: "Nhân sự", keywords: ["Nhân sự", "HR", "Tuyển dụng"] },
  { label: "Data & AI", keywords: ["Data", "AI", "Machine Learning", "Python", "SQL"] },
  { label: "Thiết kế", keywords: ["Design", "UI/UX", "Photoshop", "Figma"] },
  { label: "Logistics", keywords: ["Logistics", "Supply Chain", "Vận chuyển"] },
];

interface SearchClientProps {
  initialJobs: Job[];
  initialCompanies: Company[];
  initialQuery: string;
  initialLocation: string;
  initialType: "job" | "company";
  cities: Array<{ id: string; name: string }>;
  totalJobs: number;
  totalCompanies: number;
  allTags: string[];
}

export default function SearchClient({
  initialJobs,
  initialCompanies,
  initialQuery,
  initialLocation,
  initialType,
  cities,
  totalJobs,
  totalCompanies,
  allTags,
}: SearchClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"job" | "company">(initialType);
  const [location, setLocation] = useState(initialLocation || "Tất cả");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("moi-nhat");
  const [inputFocused, setInputFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Derived data ──────────────────────────────────────
  // Filter jobs by selected industries (local filter using tags/skills)
  const filteredJobs = selectedIndustries.length === 0
    ? initialJobs
    : initialJobs.filter((job) => {
        const jobKeywords = [
          ...job.tags.map(t => t.name),
          ...job.skills.map(s => s.name),
          job.title,
        ];
        return selectedIndustries.some(ind => {
          const filter = INDUSTRY_FILTERS.find(f => f.label === ind);
          if (!filter) return false;
          return filter.keywords.some(kw =>
            jobKeywords.some(jk => jk.toLowerCase().includes(kw.toLowerCase()))
          );
        });
      });

  const filteredCompanies = selectedIndustries.length === 0
    ? initialCompanies
    : initialCompanies.filter(comp => {
        const compKeywords = [comp.name, comp.description || ""];
        return selectedIndustries.some(ind => {
          const filter = INDUSTRY_FILTERS.find(f => f.label === ind);
          if (!filter) return false;
          return filter.keywords.some(kw =>
            compKeywords.some(ck => ck.toLowerCase().includes(kw.toLowerCase()))
          );
        });
      });

  const sortedJobs = [...filteredJobs].sort((a, b) =>
    sortBy === "moi-nhat" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) =>
    sortBy === "moi-nhat" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0
  );

  // ── Pagination ──────────────────────────────────────
  const activeList = searchType === "job" ? sortedJobs : sortedCompanies;
  const totalResults = activeList.length;
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
  const paginatedItems = activeList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter/type changes
  useEffect(() => { setCurrentPage(1); }, [searchType, selectedIndustries, sortBy]);

  // ── Search action ──────────────────────────────────────
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    params.set("type", searchType);
    if (location && location !== "Tất cả") {
      const selectedCity = cities.find(c => c.name === location);
      if (selectedCity) params.set("cityId", selectedCity.id);
      params.set("location", location);
    }
    router.push(`/searching?${params.toString()}`);
  }, [query, searchType, location, cities, router]);

  const handleTypeSwitch = (type: "job" | "company") => {
    setSearchType(type);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("type", type);
    router.push(`/searching?${params.toString()}`);
  };

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
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

  const suggestions = POPULAR_KEYWORDS.filter(k =>
    !query || k.toLowerCase().includes(query.toLowerCase())
  );

  const locations = ["Tất cả", ...cities.map(c => c.name)];

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      {/* ── Top Search Bar ── */}
      <div className="bg-gradient-to-r from-[#1a4f8a] via-[#1d5b9a] to-[#2e7bbf] py-5 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          {/* Type toggle above search */}
          <div className="flex items-center gap-2 mb-3">
            {(["job", "company"] as const).map(t => (
              <button
                key={t}
                onClick={() => handleTypeSwitch(t)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  searchType === t
                    ? "bg-white text-[#1d5b9a] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/15"
                }`}
              >
                {t === "job" ? <Briefcase size={13} /> : <Building2 size={13} />}
                {t === "job" ? "Tìm việc làm" : "Tìm công ty"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Keyword input + suggestions */}
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder={
                    searchType === "company"
                      ? "Tên công ty, lĩnh vực..."
                      : "Vị trí tuyển dụng, kỹ năng, công ty..."
                  }
                  className="px-4 py-6 rounded-full pl-10 pr-9 bg-white border-none shadow-sm text-[14px] focus-visible:ring-2 focus-visible:ring-white/50"
                />
                {query && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Suggestion dropdown */}
              {inputFocused && suggestions.length > 0 && (
                <div
                  className="absolute top-[calc(100%+6px)] left-0 z-50 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                  onMouseDown={e => e.preventDefault()}
                >
                  <p className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 pt-4 pb-2">
                    <TrendingUp size={13} className="text-[#1d5b9a]" />
                    Từ khóa phổ biến
                  </p>
                  {suggestions.slice(0, 6).map(kw => (
                    <button
                      key={kw}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm text-gray-700 text-left transition-colors"
                      onClick={() => {
                        setQuery(kw);
                        setInputFocused(false);
                      }}
                    >
                      <Search size={13} className="text-gray-400 shrink-0" />
                      {kw}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Select */}
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="px-4 py-6 w-44 rounded-full bg-white border-none shadow-sm text-[14px]">
                <MapPin size={14} className="text-gray-400 mr-1 shrink-0" />
                <SelectValue placeholder="Địa điểm" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search button */}
            <Button
              onClick={handleSearch}
              className="px-7 py-6 rounded-full bg-white text-[#1d5b9a] hover:bg-blue-50 font-bold text-[14px] shadow-sm"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-5">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-60 shrink-0 space-y-4">

          {/* Industry filter */}
          <Card className="shadow-sm gap-0 py-0 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="px-5 pt-5 pb-0 border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-[#1d5b9a]" />
                  Danh mục nghề
                </p>
                {selectedIndustries.length > 0 && (
                  <button
                    onClick={() => setSelectedIndustries([])}
                    className="text-red-500 hover:text-red-600 text-xs font-medium flex items-center gap-0.5"
                  >
                    <X size={12} /> Xóa lọc
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 py-4 space-y-0.5">
              {INDUSTRY_FILTERS.map(({ label }) => {
                const checked = selectedIndustries.includes(label);
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                      checked ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleIndustry(label)}
                  >
                    <Checkbox
                      id={`ind-${label}`}
                      checked={checked}
                      onCheckedChange={() => toggleIndustry(label)}
                      className="shrink-0"
                    />
                    <Label
                      htmlFor={`ind-${label}`}
                      className={`text-sm cursor-pointer select-none w-full ${
                        checked ? "font-semibold text-[#1d5b9a]" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </Label>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Location quick filter (when cities exist) */}
          {cities.length > 0 && (
            <Card className="shadow-sm gap-0 py-0 rounded-2xl overflow-hidden bg-white">
              <CardHeader className="px-5 pt-5 pb-0 border-b-0">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin size={15} className="text-[#1d5b9a]" />
                  Địa điểm
                </p>
              </CardHeader>
              <CardContent className="px-4 py-4 space-y-0.5">
                {["Tất cả", ...cities.map(c => c.name)].map(loc => (
                  <button
                    key={loc}
                    onClick={() => {
                      setLocation(loc);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      location === loc
                        ? "bg-blue-50 text-[#1d5b9a] font-semibold"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <main className="flex-1 min-w-0">

          {/* Result header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {searchType === "job"
                  ? (initialQuery
                      ? `Việc làm "${initialQuery}"${initialLocation && initialLocation !== "Tất cả" ? ` tại ${initialLocation}` : ""}`
                      : "Tất cả việc làm")
                  : (initialQuery
                      ? `Công ty "${initialQuery}"`
                      : "Tất cả công ty")}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Tìm thấy{" "}
                <span className="font-semibold text-[#1d5b9a]">{totalResults}</span>{" "}
                {searchType === "job" ? "việc làm" : "công ty"} phù hợp
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort select */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 rounded-full px-4 py-4 border-none shadow-sm bg-white text-sm">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moi-nhat">Mới nhất</SelectItem>
                  <SelectItem value="phu-hop-nhat">Phù hợp nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active industry badges */}
          {selectedIndustries.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedIndustries.map(ind => (
                <Badge
                  key={ind}
                  variant="outline"
                  className="rounded-full text-[#1d5b9a] border-blue-200 bg-blue-50 text-xs font-medium cursor-pointer"
                  onClick={() => toggleIndustry(ind)}
                >
                  {ind} <X size={11} className="ml-1" />
                </Badge>
              ))}
            </div>
          )}

          <Separator className="mb-4" />

          {/* ── Job Cards OR Company Cards ── */}
          {paginatedItems.length === 0 ? (
            <Card className="rounded-2xl shadow-sm bg-white">
              <CardContent className="py-20 text-center">
                <Search size={52} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold text-lg">
                  {searchType === "job" ? "Không tìm thấy việc làm phù hợp" : "Không tìm thấy công ty phù hợp"}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Thử tìm với từ khóa khác hoặc bỏ bớt bộ lọc
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full border-[#1d5b9a] text-[#1d5b9a]"
                  onClick={() => {
                    setSelectedIndustries([]);
                    setQuery("");
                    router.push("/searching");
                  }}
                >
                  Xem tất cả {searchType === "job" ? "việc làm" : "công ty"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchType === "job"
                ? (paginatedItems as Job[]).map(job => <JobResultCard key={job.id} job={job} />)
                : (paginatedItems as Company[]).map(comp => <CompanyResultCard key={comp.id} company={comp} />)
              }
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full px-4 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Trước
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                        currentPage === page
                          ? "bg-[#1d5b9a] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full px-4 disabled:opacity-40"
              >
                Sau
                <ChevronRight size={15} />
              </Button>
            </div>
          )}

          {/* Page info */}
          {totalResults > 0 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} trong tổng số {totalResults} kết quả
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

// ──────────────── Job Result Card ────────────────
function JobResultCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false);

  let salary = "Thỏa thuận";
  if (job.minSalary && job.maxSalary) {
    const fmt = (n: number) => job.currency === "VND" ? `${(n / 1e6).toFixed(0)} triệu` : `$${n.toLocaleString()}`;
    salary = `${fmt(job.minSalary)} – ${fmt(job.maxSalary)}`;
  } else if (job.minSalary) {
    salary = `Từ ${job.currency === "VND" ? `${(job.minSalary / 1e6).toFixed(0)} triệu` : `$${job.minSalary.toLocaleString()}`}`;
  } else if (job.maxSalary) {
    salary = `Đến ${job.currency === "VND" ? `${(job.maxSalary / 1e6).toFixed(0)} triệu` : `$${job.maxSalary.toLocaleString()}`}`;
  }

  const deadline = new Date(job.createdAt);
  deadline.setDate(deadline.getDate() + 30);
  const formattedDeadline = deadline.toLocaleDateString("vi-VN");

  const companyInitials = job.company.name
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Card className="rounded-2xl bg-white shadow-sm border border-transparent hover:border-blue-200 hover:shadow-md transition-all duration-200 py-0 gap-0 group">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Company logo */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1d5b9a] to-[#5ca8c1] text-white font-bold text-base shrink-0 relative overflow-hidden">
            <span className="absolute inset-0 flex items-center justify-center select-none z-0">{companyInitials}</span>
            {job.company.logoUrl && (
              <img
                src={getCompanyLogoUrl(job.company.logoUrl) || undefined}
                alt={job.company.name}
                className="absolute inset-0 w-full h-full object-cover rounded-xl z-10"
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Title */}
                <Link
                  href={`/jobs/${job.id}`}
                  className="font-bold text-gray-900 hover:text-[#1d5b9a] transition-colors text-[15px] leading-snug line-clamp-2 group-hover:text-[#1d5b9a] block"
                >
                  {job.title}
                </Link>

                {/* Company */}
                <Link
                  href={`/company/${job.company.id}`}
                  className="text-sm text-gray-500 hover:text-[#1d5b9a] mt-0.5 block truncate"
                >
                  {job.company.name}
                </Link>

                {/* Tags + Skills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.tags.slice(0, 3).map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-[#1d5b9a] border-blue-200 bg-blue-50 rounded-full text-[11px] font-medium h-auto py-0.5 px-2.5"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {job.skills.slice(0, 2).map(skill => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 bg-emerald-50 rounded-full text-[11px] font-medium h-auto py-0.5 px-2.5"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div className="text-right shrink-0">
                <p className="text-emerald-600 font-bold text-sm whitespace-nowrap">{salary}</p>
              </div>
            </div>

            {/* Footer */}
            <Separator className="mt-3 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#1d5b9a]" />
                  {job.city.name}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} className="text-[#1d5b9a]" />
                  {job.headcount} vị trí
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-gray-300" />
                  HSD: {formattedDeadline}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSaved(!saved)}
                  className={`rounded-full w-8 h-8 transition-colors ${
                    saved ? "border-red-400 text-red-400 bg-red-50" : "hover:border-red-300 hover:text-red-400"
                  }`}
                >
                  <Heart size={13} fill={saved ? "currentColor" : "none"} />
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-[#1d5b9a] hover:bg-[#164879] text-white text-xs font-semibold px-4 h-8"
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

// ──────────────── Company Result Card ────────────────
function CompanyResultCard({ company }: { company: Company }) {
  const companyInitials = company.name
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const jobCount = (company as any)._count?.jobs ?? company.jobs?.length ?? 0;

  return (
    <Card className="rounded-2xl bg-white shadow-sm border border-transparent hover:border-emerald-200 hover:shadow-md transition-all duration-200 py-0 gap-0 group">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Company logo */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold text-base shrink-0 relative overflow-hidden">
            <span className="absolute inset-0 flex items-center justify-center select-none z-0">{companyInitials}</span>
            {company.logoUrl && (
              <img
                src={getCompanyLogoUrl(company.logoUrl) || undefined}
                alt={company.name}
                className="absolute inset-0 w-full h-full object-cover rounded-xl z-10"
                onError={e => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/company/${company.id}`}
                  className="font-bold text-gray-900 hover:text-emerald-600 transition-colors text-[15px] leading-snug group-hover:text-emerald-600 block"
                >
                  {company.name}
                </Link>

                {company.type && (
                  <span className="text-xs text-gray-400 mt-0.5 block">{company.type.name}</span>
                )}

                {company.description && (
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <Separator className="mt-3 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {company.address && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-500" />
                    {company.address}
                  </span>
                )}
                {company.size && (
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-emerald-500" />
                    {company.size} nhân viên
                  </span>
                )}
                {jobCount > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Briefcase size={12} />
                    {jobCount} việc làm
                  </span>
                )}
              </div>
              <Button
                size="sm"
                asChild
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 h-8"
              >
                <Link href={`/company/${company.id}`}>Xem hồ sơ</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
