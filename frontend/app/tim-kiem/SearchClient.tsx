"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Job } from "@/types/job";

const INDUSTRIES = ["Kế toán", "Marketing", "IT - Phần mềm", "Kinh doanh", "Nhân sự", "Logistics", "Tài chính - Ngân hàng"];
const POPULAR_KEYWORDS = ["frontend", "backend", "fullstack", "marketing", "data analyst", "project manager", "designer"];

interface SearchClientProps {
  initialJobs: Job[];
  initialQuery: string;
  initialLocation: string;
  cities: Array<{ id: string; name: string }>;
}

export default function SearchClient({ initialJobs, initialQuery, initialLocation, cities }: SearchClientProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"job" | "company">("job");
  const [location, setLocation] = useState(initialLocation || "Tất cả");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("phu-hop-nhat");
  const [inputFocused, setInputFocused] = useState(false);
  const [filteredInput, setFilteredInput] = useState(initialQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter jobs locally
  const filtered = initialJobs.filter((job) => {
    const matchIndustry =
      selectedIndustries.length === 0 ||
      job.tags.some((t) => selectedIndustries.includes(t.name));
    return matchIndustry;
  });

  const sortedJobs = [...filtered].sort((a, b) =>
    sortBy === "moi-nhat" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filteredInput) params.set("q", filteredInput);
    params.set("type", searchType);
    if (location && location !== "Tất cả") {
      const selectedCity = cities.find(c => c.name === location);
      if (selectedCity) params.set("cityId", selectedCity.id);
    }
    router.push(`/tim-kiem?${params.toString()}`);
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

  const locations = ["Tất cả", ...cities.map(c => c.name)];

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
              {locations.map((loc) => (
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
function JobResultCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false);

  // Format salary
  let salary = 'Thỏa thuận';
  if (job.minSalary && job.maxSalary) {
    const formatSalary = (amount: number) => {
      if (job.currency === 'VND') {
        return `${(amount / 1000000).toFixed(0)} triệu`;
      }
      return `$${amount.toLocaleString()}`;
    };
    salary = `${formatSalary(job.minSalary)} - ${formatSalary(job.maxSalary)}`;
  } else if (job.minSalary) {
    salary = `Từ ${job.currency === 'VND' ? `${(job.minSalary / 1000000).toFixed(0)} triệu` : `$${job.minSalary.toLocaleString()}`}`;
  }

  // Format deadline
  const deadline = new Date(job.createdAt);
  deadline.setDate(deadline.getDate() + 30);
  const formattedDeadline = deadline.toLocaleDateString('vi-VN');

  // Get company initials for logo
  const companyInitials = job.company.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  return (
    <Card className="rounded-2xl bg-white shadow-sm border border-transparent hover:border-blue-200 hover:shadow-md transition-all duration-200 py-0 gap-0 group">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* Company logo */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1d5b9a] to-[#5ca8c1] text-white font-bold text-sm shrink-0">
            {job.company.logoUrl ? (
              <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              companyInitials
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Title */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-bold text-foreground hover:text-[#1d5b9a] transition-colors text-[15px] leading-tight line-clamp-1 group-hover:text-[#1d5b9a]"
                  >
                    {job.title}
                  </Link>
                </div>

                {/* Company */}
                <Link
                  href={`/company/${job.company.id}`}
                  className="text-sm text-muted-foreground hover:text-[#1d5b9a] mt-0.5 block truncate"
                >
                  {job.company.name}
                </Link>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-[#1d5b9a] border-blue-200 bg-blue-50 rounded-full text-[11px] font-medium h-auto py-0.5 px-2.5"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {job.skills.slice(0, 2).map((skill) => (
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
                <p className="text-emerald-600 font-bold text-sm whitespace-nowrap">
                  {salary}
                </p>
              </div>
            </div>

            {/* Footer */}
            <Separator className="mt-3 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-[#1d5b9a]" />
                  {job.city.name}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} className="text-[#1d5b9a]" />
                  {job.headcount} vị trí
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-muted-foreground/60" />
                  HSD: {formattedDeadline}
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
