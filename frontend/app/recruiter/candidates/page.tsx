"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Plus,
  ArrowRight,
  Users,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateCard } from "@/components/recruiter/CandidateCard";
import { InterviewCard } from "@/components/recruiter/InterviewCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { jobService } from "@/services/jobService";
import { applicationService } from "@/services/applicationService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
export type MatchLevel = "Phù hợp cao" | "Phù hợp trung bình" | "Phù hợp thấp";

export interface Candidate {
  jobId?: number | string;
  id: number | string;
  name: string;
  role: string;
  experience: string;
  skills: string[];
  avatar: string;
  matchScore: number;
  matchLevel: MatchLevel;
  summary: string;
  workHistory: { company: string; period: string }[];
  education: string;
  skillScores: { name: string; score: number }[];
  status: "reviewing" | "matched" | "contacted" | "rejected";
  cvUrl?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const activeJobs = [
  {
    id: 1,
    title: "Frontend Developer (ReactJS)",
    department: "Phòng ban: Tech",
    type: "Hình thức: Toàn thời gian",
    location: "Địa điểm: Hà Nội",
    postDate: "Đăng tin: 12/05/2026",
    deadline: "Hạn nộp: 12/06/2026",
    stats: { total: 128, reviewing: 28, matched: 36, contacted: 14, rejected: 20 },
  },
  {
    id: 2,
    title: "Backend Developer (NestJS)",
    department: "Phòng ban: Tech",
    type: "Hình thức: Toàn thời gian",
    location: "Địa điểm: TP. Hồ Chí Minh",
    postDate: "Đăng tin: 10/05/2026",
    deadline: "Hạn nộp: 10/06/2026",
    stats: { total: 84, reviewing: 20, matched: 22, contacted: 8, rejected: 12 },
  },
  {
    id: 3,
    title: "UI/UX Designer",
    department: "Phòng ban: Design",
    type: "Hình thức: Hybrid",
    location: "Địa điểm: Đà Nẵng",
    postDate: "Đăng tin: 08/05/2026",
    deadline: "Hạn nộp: 08/06/2026",
    stats: { total: 56, reviewing: 12, matched: 18, contacted: 6, rejected: 9 },
  },
];

type ActiveJob = typeof activeJobs[0];

const candidates: Candidate[] = [
  {
    id: 1, jobId: 1,
    name: "Nguyễn Văn A", role: "Frontend Developer", experience: "3 năm kinh nghiệm",
    skills: ["React", "JavaScript", "UI/UX"], avatar: "https://i.pravatar.cc/80?img=1",
    matchScore: 85, matchLevel: "Phù hợp cao",
    summary: "Kinh nghiệm phát triển các ứng dụng web với React, TypeScript và kiến trúc component.",
    workHistory: [{ company: "Frontend tại TechCorp", period: "01/2023 – Hiện tại" }],
    education: "Đại học Bách Khoa Hà Nội – Khoa CNTT",
    skillScores: [{ name: "React", score: 90 }, { name: "TypeScript", score: 85 }, { name: "UI/UX", score: 80 }],
    status: "reviewing",
  },
  {
    id: 2, jobId: 1,
    name: "Lê Văn H", role: "Frontend Developer", experience: "3 năm kinh nghiệm",
    skills: ["React", "TypeScript", "UI/UX"], avatar: "https://i.pravatar.cc/80?img=3",
    matchScore: 85, matchLevel: "Phù hợp cao",
    summary: "Kinh nghiệm phát triển các ứng dụng web với React, TypeScript và kiến trúc component.",
    workHistory: [{ company: "Frontend tại TechCorp", period: "01/2023 – Hiện tại" }],
    education: "Đại học Bách Khoa Hà Nội – Khoa CNTT",
    skillScores: [{ name: "React", score: 90 }, { name: "TypeScript", score: 85 }, { name: "UI/UX", score: 80 }],
    status: "matched",
  },
  {
    id: 3, jobId: 3,
    name: "Phạm Thị K", role: "UI/UX Designer", experience: "2 năm kinh nghiệm",
    skills: ["Figma", "UI/UX", "Adobe XD"], avatar: "https://i.pravatar.cc/80?img=5",
    matchScore: 80, matchLevel: "Phù hợp trung bình",
    summary: "Thiết kế UI/UX chuyên nghiệp với Figma và Adobe XD, có kinh nghiệm làm việc agile.",
    workHistory: [{ company: "UI Designer tại DesignHub", period: "06/2022 – Hiện tại" }],
    education: "Đại học Kiến trúc Hà Nội – Thiết kế đồ họa",
    skillScores: [{ name: "Figma", score: 92 }, { name: "Adobe XD", score: 85 }, { name: "UI/UX", score: 88 }],
    status: "matched",
  },
  {
    id: 4, jobId: 2,
    name: "Trần Văn L", role: "Backend Developer", experience: "3 năm kinh nghiệm",
    skills: ["NestJS", "Node.js", "PostgreSQL"], avatar: "https://i.pravatar.cc/80?img=7",
    matchScore: 73, matchLevel: "Phù hợp trung bình",
    summary: "Xây dựng REST API với NestJS, quản lý database PostgreSQL và tối ưu hiệu năng.",
    workHistory: [{ company: "Backend tại CloudBase", period: "03/2021 – Hiện tại" }],
    education: "Học viện Công nghệ Bưu chính Viễn thông",
    skillScores: [{ name: "NestJS", score: 88 }, { name: "Node.js", score: 82 }, { name: "PostgreSQL", score: 79 }],
    status: "reviewing",
  },
  {
    id: 5, jobId: 2,
    name: "Đặng Văn M", role: "Backend Developer", experience: "2 năm kinh nghiệm",
    skills: ["NestJS", "TypeScript", "MySQL"], avatar: "https://i.pravatar.cc/80?img=8",
    matchScore: 85, matchLevel: "Phù hợp thấp",
    summary: "Phát triển backend với NestJS và TypeScript, tích hợp các service bên thứ ba.",
    workHistory: [{ company: "Backend tại DataCo", period: "08/2022 – Hiện tại" }],
    education: "Đại học Kinh tế Quốc dân – CNTT",
    skillScores: [{ name: "NestJS", score: 88 }, { name: "TypeScript", score: 75 }, { name: "MySQL", score: 80 }],
    status: "contacted",
  },
  {
    id: 6, jobId: 3,
    name: "Hoàng Thị N", role: "UI/UX Designer", experience: "2 năm kinh nghiệm",
    skills: ["Figma", "Sketch", "Prototyping"], avatar: "https://i.pravatar.cc/80?img=9",
    matchScore: 65, matchLevel: "Phù hợp thấp",
    summary: "Thiết kế UI/UX với Figma và Sketch, có kinh nghiệm nghiên cứu người dùng.",
    workHistory: [{ company: "Designer tại BizSolutions", period: "02/2023 – Hiện tại" }],
    education: "Đại học Ngoại Thương – Truyền thông đa phương tiện",
    skillScores: [{ name: "Figma", score: 85 }, { name: "Sketch", score: 90 }, { name: "Prototyping", score: 70 }],
    status: "rejected",
  },
];

const interviews = [
  {
    id: 1,
    day: "15",
    dayOfWeek: "TH5",
    time: "10:00 AM",
    name: "Nguyễn Văn A",
    role: "Frontend Developer",
    room: "Phòng văn phòng 1",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    day: "16",
    dayOfWeek: "TH6",
    time: "02:00 PM",
    name: "Lê Văn H",
    role: "Frontend Developer",
    room: "Phòng kỹ thuật",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 3,
    day: "17",
    dayOfWeek: "TH7",
    time: "09:30 AM",
    name: "Phạm Thị K",
    role: "UI/UX Designer",
    room: "Phòng văn phòng 1",
    avatar: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: 4,
    day: "18",
    dayOfWeek: "TH8",
    time: "11:00 AM",
    name: "Trần Văn L",
    role: "DevOps Engineer",
    room: "Phòng kỹ thuật",
    avatar: "https://i.pravatar.cc/40?img=7",
  },
];

type TabValue = "all" | "reviewing" | "matched" | "contacted" | "rejected";

const tabsConfig: { value: TabValue; label: string; count: number }[] = [
  { value: "all", label: "Tất cả", count: 128 },
  { value: "reviewing", label: "Đang xem xét", count: 28 },
  { value: "matched", label: "Phù hợp cao", count: 36 },
  { value: "contacted", label: "Đã liên hệ", count: 14 },
  { value: "rejected", label: "Đã từ chối", count: 20 },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecruiterCandidatesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Real data state
  const { isAuthenticated, isLoading: authLoading, token: authToken } = useAuth();
  const router = useRouter();
  const [activeJobsState, setActiveJobsState] = useState<any[]>([]);
  const [candidatesState, setCandidatesState] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJobId, activeTab]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isAuthenticated && authToken) {
      fetchRealData(authToken);
    }
  }, [isAuthenticated, authLoading, authToken, router]);

  const fetchRealData = async (token: string) => {
    try {
      setLoading(true);
      if (!token) {
        console.warn("No auth token available");
        setActiveJobsState(activeJobs);
        setCandidatesState(candidates);
        return;
      }

      const jobsData = await jobService.getRecruiterJobs(token);
      if (jobsData.length > 0) {
        // Fetch applications for all jobs
        const appsPromises = jobsData.map(job => 
          applicationService.getApplicationsByJob(job.id, token).catch(() => [])
        );
        const appsArrays = await Promise.all(appsPromises);
        const allApplications = appsArrays.flat();

        // Map applications to candidates
        const mappedCandidates = allApplications.map((app: any) => {
          const candidateUser = app.cv?.candidate?.user;
          const fullName = candidateUser ? `${candidateUser.firstName || ''} ${candidateUser.lastName || ''}`.trim() : "Ứng viên ẩn danh";
          
          let matchLevel: MatchLevel = "Phù hợp trung bình";
          if (app.matchLevel === "HIGH") matchLevel = "Phù hợp cao";
          else if (app.matchLevel === "LOW") matchLevel = "Phù hợp thấp";

          let skills: string[] = [];
          if (app.cv?.cvData?.skills) {
            skills = app.cv.cvData.skills.map((s: any) => typeof s === 'string' ? s : s.skill).filter(Boolean);
          }
          if (skills.length === 0) {
            skills = ["React", "JavaScript", "HTML/CSS"];
          }

          let workHistory = [];
          if (app.cv?.cvData?.experiences) {
            workHistory = app.cv.cvData.experiences.map((exp: any) => ({
              company: `${exp.position} tại ${exp.company}`,
              period: exp.duration || ""
            }));
          }
          if (workHistory.length === 0) {
            workHistory = [{ company: "Chưa cập nhật kinh nghiệm", period: "" }];
          }

          let education = "Chưa cập nhật học vấn";
          if (app.cv?.cvData?.education?.[0]) {
            const edu = app.cv.cvData.education[0];
            education = `${edu.school} - ${edu.major || ''} (${edu.degree || ''})`;
          }

          const skillScores = skills.map(s => ({ name: s, score: Math.floor(Math.random() * 20) + 70 }));

          return {
            id: app.id,
            jobId: app.jobId,
            name: fullName,
            role: app.cv?.cvData?.jobTitle || app.job?.title || "Ứng viên",
            experience: app.cv?.cvData?.experiences?.[0] ? "Có kinh nghiệm" : "Dưới 1 năm kinh nghiệm",
            skills,
            avatar: candidateUser?.avaUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff`,
            matchScore: app.matchScore || 0,
            matchLevel,
            summary: app.aiFeedback || app.cv?.cvData?.summary || "Hồ sơ ứng viên nộp qua cổng thông tin Job Connect.",
            workHistory,
            education,
            skillScores,
            status: (app.matchScore ? (app.matchLevel === "HIGH" ? "matched" : "reviewing") : "reviewing") as "reviewing" | "matched" | "contacted" | "rejected",
            cvUrl: app.cv?.cvUrl 
              ? (app.cv.cvUrl.startsWith('http') ? app.cv.cvUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${app.cv.cvUrl}`)
              : "",
          };
        });

        // Map jobs to ActiveJob
        const mappedJobs = jobsData.map(job => {
          const jobApps = allApplications.filter((app: any) => app.jobId === job.id);
          const total = jobApps.length;
          const reviewing = jobApps.filter((a: any) => !a.matchScore).length;
          const matched = jobApps.filter((a: any) => a.matchLevel === "HIGH").length;
          const contacted = jobApps.filter((a: any) => a.matchLevel === "MEDIUM").length;
          const rejected = jobApps.filter((a: any) => a.matchLevel === "LOW").length;

          return {
            id: job.id,
            title: job.title,
            department: `Bộ phận: ${job.company?.name || 'Nhân sự'}`,
            type: `Hình thức: ${job.currency === 'USD' ? 'Global' : 'Toàn thời gian'}`,
            location: `Địa điểm: ${job.city?.name || 'Hà Nội'}`,
            postDate: `Đăng tin: ${new Date(job.createdAt).toLocaleDateString('vi-VN')}`,
            deadline: `Hạn nộp: 30 ngày sau`,
            stats: { total, reviewing, matched, contacted, rejected },
          };
        });

        setCandidatesState(mappedCandidates);
        setActiveJobsState(mappedJobs);
      } else {
        // Fallback to mock data if recruiter has no jobs posted yet
        setActiveJobsState(activeJobs);
        setCandidatesState(candidates);
      }
    } catch (error) {
      console.error("Failed to load real data:", error);
      // Fallback
      setActiveJobsState(activeJobs);
      setCandidatesState(candidates);
    } finally {
      setLoading(false);
    }
  };

  const selectedJob = activeJobsState.find((j) => j.id === selectedJobId) ?? null;

  const filteredCandidates = candidatesState.filter((c) => {
    const matchJob = selectedJobId === null || c.jobId === selectedJobId;
    const matchTab = activeTab === "all" || c.status === activeTab;
    return matchJob && matchTab;
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const currentCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Dynamic tab counts based on job filter
  const tabCounts = {
    all: selectedJobId ? candidatesState.filter((c) => c.jobId === selectedJobId).length : candidatesState.length,
    reviewing: candidatesState.filter((c) => (selectedJobId ? c.jobId === selectedJobId : true) && c.status === "reviewing").length,
    matched:   candidatesState.filter((c) => (selectedJobId ? c.jobId === selectedJobId : true) && c.status === "matched").length,
    contacted: candidatesState.filter((c) => (selectedJobId ? c.jobId === selectedJobId : true) && c.status === "contacted").length,
    rejected:  candidatesState.filter((c) => (selectedJobId ? c.jobId === selectedJobId : true) && c.status === "rejected").length,
  };

  const handleJobSelect = (jobId: string | number) => {
    setSelectedJobId((prev) => (prev === jobId ? null : jobId));
    setActiveTab("all");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f5fb]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto animate-duration-1000" />
          <p className="mt-4 text-gray-600 font-medium">Đang tải danh sách ứng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroBanner />
      <ActiveJobSection jobs={activeJobsState} selectedJobId={selectedJobId} onSelect={handleJobSelect} />

      {/* Candidates Section */}
      <section>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h2 className="text-lg font-bold text-gray-800">Ứng viên đã ứng tuyển</h2>
          {selectedJob && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full pl-3 pr-2 py-1">
              <span className="text-xs font-semibold text-blue-700">{selectedJob.title}</span>
              <button
                onClick={() => setSelectedJobId(null)}
                className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors"
              >
                <X className="h-2.5 w-2.5 text-blue-700" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex flex-wrap gap-1.5">
            {([
              { value: "all",       label: "Tất cả",        count: tabCounts.all },
              { value: "reviewing", label: "Đang xem xét",   count: tabCounts.reviewing },
              { value: "matched",   label: "Phù hợp cao",    count: tabCounts.matched },
              { value: "contacted", label: "Đã liên hệ",     count: tabCounts.contacted },
              { value: "rejected",  label: "Đã từ chối",     count: tabCounts.rejected },
            ] as { value: TabValue; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all duration-150",
                  activeTab === tab.value
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                )}
              >
                {tab.label}{" "}
                <span className={cn("ml-0.5 text-xs font-semibold", activeTab === tab.value ? "text-blue-100" : "text-gray-400")}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
          <Select>
            <SelectTrigger className="h-10 bg-white w-[160px] border-gray-200">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              {["Mới nhất", "Phù hợp nhất", "Cũ nhất"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Candidate Grid */}
        {filteredCandidates.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentCandidates.map((candidate, i) => (
                <CandidateCard key={candidate.id} candidate={candidate} index={i} />
              ))}
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-gray-100 bg-white px-5 py-4 rounded-2xl mt-6 shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-200"
                  >
                    Trước
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-200"
                  >
                    Sau
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">
                      Hiển thị <span className="font-extrabold text-blue-600">{(currentPage - 1) * itemsPerPage + 1}</span> đến{" "}
                      <span className="font-extrabold text-blue-600">
                        {Math.min(currentPage * itemsPerPage, filteredCandidates.length)}
                      </span>{" "}
                      trong số <span className="font-extrabold text-gray-700">{filteredCandidates.length}</span> ứng viên
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm gap-1" aria-label="Pagination">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-all border-gray-200 bg-white"
                      >
                        <span className="sr-only">Trang trước</span>
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      
                      {/* Page numbers */}
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            className={cn(
                              "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                              currentPage === pageNum
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-blue-600"
                                : "hover:border-blue-300 hover:text-blue-600 border-gray-200 bg-white text-gray-500"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}

                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-all border-gray-200 bg-white"
                      >
                        <span className="sr-only">Trang sau</span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Không có ứng viên nào</p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedJob ? `Chưa có ứng viên ứng tuyển vào vị trí "${selectedJob.title}"` : "Thử chọn bộ lọc khác"}
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Interviews */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Lịch phỏng vấn sắp tới</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {interviews.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Xem tất cả lịch phỏng vấn <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white p-8 shadow-lg min-h-[160px]">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full" />
      <div className="absolute top-4 right-24 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-12 right-12 w-36 h-36 bg-white/5 rounded-full" />

      {/* Dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
          style={{ top: `${15 + i * 12}%`, right: `${30 + (i % 3) * 8}%` }}
        />
      ))}

      <div className="relative z-10 max-w-lg">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
          Quản lý ứng viên hiệu quả
          <br />
          cùng AI Job Connect
        </h1>
        <p className="text-blue-100 text-sm mb-6">
          Xem, đánh giá và quản lý tất cả ứng viên đã ứng tuyển vào tin đăng của bạn.
        </p>
        <Link href="/recruiter/post-job" className="bg-white px-4 py-2 rounded-full w-fit flex items-center gap-2 text-blue-600 hover:bg-blue-50 font-semibold  shadow-md">
          <Plus className="h-4 w-4" />
          Đăng tin mới
        </Link>
      </div>

      {/* Illustration */}
      <div className="absolute right-8 bottom-0 hidden lg:flex items-end">
        <div className="relative mb-4">
          <div className="w-32 h-24 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center shadow-xl">
            <div className="w-20 h-16 bg-white/30 rounded flex flex-col gap-1 p-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 bg-white/60 rounded-full"
                  style={{ width: `${60 + i * 10}%` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-md">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-300/50 rounded-full border-2 border-white/40 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Active Job Section ───────────────────────────────────────────────────────
function ActiveJobSection({
  jobs,
  selectedJobId,
  onSelect,
}: {
  jobs: any[];
  selectedJobId: string | number | null;
  onSelect: (id: string | number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [jobs]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">Tin tuyển dụng đang hoạt động</h2>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
            {jobs.length}
          </span>
          {selectedJobId && (
            <span className="text-xs text-blue-600 font-medium bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 animate-pulse">
              Đang lọc theo tin
            </span>
          )}
        </div>
        <Link href="/recruiter/dashboard">
          <Button variant="outline" className="text-blue-600 border-blue-200 gap-1 text-sm hover:bg-blue-50">
            Xem tất cả tin đăng <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Slider Viewport Container */}
      <div className="relative group px-1">
        {/* Left navigation arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-gray-100 flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all text-gray-600 hover:text-blue-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right navigation arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 border border-gray-100 flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all text-gray-600 hover:text-blue-600"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 no-scrollbar"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
          }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}} />

          {jobs.map((job) => (
            <ActiveJobCard
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Active Job Card ──────────────────────────────────────────────────────────
function ActiveJobCard({
  job,
  isSelected,
  onSelect,
}: {
  job: any;
  isSelected: boolean;
  onSelect: (id: string | number) => void;
}) {
  return (
    <Card
      onClick={() => onSelect(job.id)}
      className={cn(
        "w-[340px] shrink-0 border shadow-sm bg-white cursor-pointer transition-all duration-200 flex flex-col justify-between hover:shadow-md",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
          : "border-gray-200 hover:border-blue-200"
      )}
    >
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
        {/* Header: Icon & Title */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            isSelected ? "bg-blue-600" : "bg-blue-100"
          )}>
            <FileText className={cn("h-5 w-5", isSelected ? "text-white" : "text-blue-600")} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5 py-0 font-medium">
                Đang tuyển
              </Badge>
              {isSelected && (
                <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0 border-0 font-medium">
                  Đang lọc
                </Badge>
              )}
            </div>
            <Link
              href={`/recruiter/jobs/${job.id}`}
              className="font-bold text-gray-900 hover:text-blue-600 hover:underline transition-colors block text-sm truncate"
              onClick={(e) => e.stopPropagation()}
              title={job.title}
            >
              {job.title}
            </Link>
            <div className="text-[11px] text-gray-500 mt-0.5 truncate">
              {job.department}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg">
          <span className="truncate max-w-[120px]">{job.location}</span>
          <span className="text-gray-300">|</span>
          <span>{job.type}</span>
          <span className="text-gray-300">|</span>
          <span className="truncate">{job.postDate}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-1.5 text-center bg-gray-50/50 p-2 rounded-lg border border-gray-100">
          {[
            { label: "Tổng", value: job.stats.total, color: "text-blue-600 font-extrabold" },
            { label: "Xét", value: job.stats.reviewing, color: "text-gray-700 font-bold" },
            { label: "Cao", value: job.stats.matched, color: "text-emerald-600 font-bold" },
            { label: "L.Hệ", value: job.stats.contacted, color: "text-blue-500 font-bold" },
            { label: "Từ chối", value: job.stats.rejected, color: "text-red-500 font-bold" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-sm ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-gray-400 font-medium truncate w-full">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/recruiter/jobs/${job.id}`}
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-blue-600 h-8"
            >
              Chi tiết tin
            </Button>
          </Link>
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "flex-1 text-xs gap-1 h-8",
              isSelected
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                : "text-blue-600 border-blue-200 hover:bg-blue-50"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(job.id);
            }}
          >
            {isSelected ? "Bỏ lọc" : "Lọc ứng viên"} <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
