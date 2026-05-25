'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { jobService } from "@/services/jobService";
import { applicationService } from "@/services/applicationService";
import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  MapPin, 
  DollarSign, 
  Calendar,
  ChevronLeft,
  FileText,
  Brain,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JobDetailsPage() {
  const { id } = useParams() as { id: string };
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [isMatchingAll, setIsMatchingAll] = useState(false);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL"); // ALL, HIGH, MEDIUM, LOW, UNMATCHED
  const [sortOrder, setSortOrder] = useState<string>("NEWEST"); // NEWEST, SCORE_DESC

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && token && id) {
      fetchJobAndApplications();
    }
  }, [id, isAuthenticated, authLoading, token, router]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) return;

      const [jobData, appData] = await Promise.all([
        jobService.getRecruiterJobById(id, token),
        applicationService.getApplicationsByJob(id, token)
      ]);

      setJob(jobData);
      setApplications(appData);
    } catch (err: any) {
      console.error("Error loading job details:", err);
      setError(err.message || "Không thể tải thông tin chi tiết công việc");
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (appId: string) => {
    if (!token) return;
    try {
      setMatchingId(appId);
      const updatedApp = await applicationService.matchApplication(appId, token);
      
      // Update applications state
      setApplications(prev => 
        prev.map(app => app.id === appId ? { ...app, ...updatedApp } : app)
      );
      setExpandedFeedbackId(appId); // Auto-expand matching feedback
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi chạy đánh giá AI");
    } finally {
      setMatchingId(null);
    }
  };

  const handleMatchAll = async () => {
    const unmatchedApps = applications.filter(app => !app.matchScore);
    if (unmatchedApps.length === 0) {
      toast.success("Tất cả ứng viên đã được phân tích phù hợp!");
      return;
    }

    if (!token) return;
    if (!confirm(`Bạn có muốn chạy phân tích AI cho ${unmatchedApps.length} ứng viên chưa đánh giá không? (Quá trình này có thể mất vài giây)`)) {
      return;
    }

    try {
      setIsMatchingAll(true);
      for (const app of unmatchedApps) {
        setMatchingId(app.id);
        const updatedApp = await applicationService.matchApplication(app.id, token);
        setApplications(prev => 
          prev.map(a => a.id === app.id ? { ...a, ...updatedApp } : a)
        );
      }
      toast.success("Đã hoàn thành đánh giá AI cho toàn bộ ứng viên!");
    } catch (err: any) {
      console.error("Match all error:", err);
      toast.error("Có lỗi xảy ra trong quá trình đánh giá hàng loạt.");
    } finally {
      setMatchingId(null);
      setIsMatchingAll(false);
    }
  };

  // Filter and Sort Applications
  const filteredApplications = applications.filter(app => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "UNMATCHED") return !app.matchScore;
    return app.matchLevel === activeFilter;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortOrder === "SCORE_DESC") {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    // Newest first
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });

  // Calculate statistics
  const matchedCount = applications.filter(a => a.matchScore !== null).length;
  const highMatchCount = applications.filter(a => a.matchLevel === "HIGH").length;
  const mediumMatchCount = applications.filter(a => a.matchLevel === "MEDIUM").length;
  const lowMatchCount = applications.filter(a => a.matchLevel === "LOW").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Đang tải chi tiết công việc...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full border-red-100 shadow-lg">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-gray-600 mb-6">{error || "Không tìm thấy thông tin tin tuyển dụng"}</p>
            <Link href="/recruiter/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Quay lại Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/recruiter/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
            <ChevronLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              job.status === "PUBLISHED" ? "bg-green-100 text-green-700 border border-green-200" :
              job.status === "DRAFT" ? "bg-gray-100 text-gray-700 border border-gray-200" :
              "bg-yellow-100 text-yellow-700 border border-yellow-200"
            }`}>
              {job.status === "PUBLISHED" ? "Đang tuyển" :
               job.status === "DRAFT" ? "Nháp" : "Chờ duyệt"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Job Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
              <div className="flex items-center gap-2.5 mb-2">
                <Briefcase className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wider text-blue-100">Chi tiết công việc</span>
              </div>
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="text-sm text-blue-100 mt-1">{job.company?.name}</p>
            </div>
            <CardContent className="p-6 space-y-6">
              
              {/* Core attributes */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Địa điểm</div>
                    <div className="text-sm font-semibold text-gray-800">{job.city?.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Mức lương</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {job.minSalary || job.maxSalary ? (
                        <>
                          {job.minSalary?.toLocaleString('vi-VN')} - {job.maxSalary?.toLocaleString('vi-VN')} {job.currency}
                        </>
                      ) : "Thỏa thuận"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Số lượng tuyển</div>
                    <div className="text-sm font-semibold text-gray-800">{job.headcount} người</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Ngày đăng</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Skills */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2.5">Kỹ năng yêu cầu</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills && job.skills.length > 0 ? (
                    job.skills.map((skill: any) => (
                      <span key={skill.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                        {skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">Không có yêu cầu kỹ năng cụ thể</span>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Mô tả công việc</h4>
                <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                  {job.description}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Candidates & AI Matching */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Stats Overview */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1 rounded bg-indigo-500/20 text-indigo-300">
                    <Brain className="h-5 w-5 text-indigo-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                    Trợ lý Tuyển dụng AI (Gemini)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  So khớp thông tin CV của ứng viên với mô tả công việc của bạn để đưa ra điểm số phù hợp và lý do tương đồng chính xác nhất.
                </p>
              </div>
              <Button
                onClick={handleMatchAll}
                disabled={isMatchingAll || matchingId !== null}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-indigo-900/30 gap-1.5 text-xs px-5 py-2.5 rounded-lg border-0 shrink-0 self-start md:self-center transition-all duration-200"
              >
                {isMatchingAll ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                    Đang đánh giá ({applications.filter(a => a.matchScore).length}/{applications.length})...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Đánh giá toàn bộ ứng viên
                  </>
                )}
              </Button>
            </div>

            <hr className="border-slate-800 my-5" />

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-800/40 border border-slate-800/50 rounded-lg p-3">
                <div className="text-xl font-extrabold text-blue-400">{applications.length}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Tổng ứng tuyển</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-800/50 rounded-lg p-3">
                <div className="text-xl font-extrabold text-indigo-400">{matchedCount}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Đã khớp AI</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-800/50 rounded-lg p-3">
                <div className="text-xl font-extrabold text-emerald-400">{highMatchCount}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Phù hợp cao</div>
              </div>
              <div className="bg-slate-800/40 border border-slate-800/50 rounded-lg p-3">
                <div className="text-xl font-extrabold text-amber-500">{mediumMatchCount + lowMatchCount}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Phù hợp khác</div>
              </div>
            </div>
          </div>

          {/* Applications list section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-800">Danh sách ứng viên</h3>
              
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none"
                >
                  <option value="NEWEST">Nộp mới nhất</option>
                  <option value="SCORE_DESC">Điểm AI: Cao xuống thấp</option>
                </select>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                { value: "ALL", label: "Tất cả", count: applications.length },
                { value: "HIGH", label: "Phù hợp cao", count: highMatchCount, color: "bg-emerald-500" },
                { value: "MEDIUM", label: "Trung bình", count: mediumMatchCount, color: "bg-blue-500" },
                { value: "LOW", label: "Phù hợp thấp", count: lowMatchCount, color: "bg-red-500" },
                { value: "UNMATCHED", label: "Chưa đánh giá", count: applications.length - matchedCount, color: "bg-gray-400" },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-semibold border rounded-full transition-all flex items-center gap-1.5 ${
                    activeFilter === tab.value 
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {tab.label}
                  <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                    activeFilter === tab.value
                      ? "bg-blue-700 text-blue-100"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* List */}
            {sortedApplications.length === 0 ? (
              <Card className="border-gray-200 shadow-sm bg-white">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold text-sm">Không tìm thấy ứng viên nào</p>
                  <p className="text-xs text-gray-400 mt-1">Chưa có ứng viên nào khớp với bộ lọc đã chọn.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedApplications.map(app => {
                  const candidateUser = app.cv?.candidate?.user;
                  const isExpanded = expandedFeedbackId === app.id;
                  
                  return (
                    <Card key={app.id} className={`border transition-all duration-200 bg-white ${
                      app.matchLevel === "HIGH" ? "border-l-4 border-l-emerald-500 border-gray-200" :
                      app.matchLevel === "MEDIUM" ? "border-l-4 border-l-blue-500 border-gray-200" :
                      app.matchLevel === "LOW" ? "border-l-4 border-l-red-400 border-gray-200" :
                      "border-gray-200"
                    } hover:shadow-md`}>
                      <CardContent className="p-5">
                        
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          
                          {/* Left info */}
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-inner">
                              {candidateUser?.avaUrl ? (
                                <img src={candidateUser.avaUrl} alt="Avatar" className="h-full w-full object-cover" />
                              ) : (
                                <span>{candidateUser?.firstName?.charAt(0) || "U"}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">
                                {candidateUser ? `${candidateUser.firstName || ''} ${candidateUser.lastName || ''}`.trim() : "Ứng viên ẩn danh"}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">{candidateUser?.email}</p>
                              
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Nộp ngày {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                                </span>
                                
                                {app.cv && (
                                  <Link 
                                    href={`/recruiter/cv/${app.id}`}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline cursor-pointer"
                                  >
                                    <FileText className="h-3 w-3" />
                                    {app.cv.title || "Xem CV chi tiết"}
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right side score badge / Match Action */}
                          <div className="flex flex-col items-start sm:items-end gap-2.5 self-start shrink-0">
                            
                            {app.matchScore !== null ? (
                              <div className="flex items-center gap-2.5">
                                <div className="text-right">
                                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Độ phù hợp AI</div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                      app.matchLevel === "HIGH" ? "bg-emerald-100 text-emerald-700" :
                                      app.matchLevel === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                                      "bg-red-100 text-red-700"
                                    }`}>
                                      {app.matchLevel === "HIGH" ? "Phù hợp cao" :
                                       app.matchLevel === "MEDIUM" ? "Phù hợp vừa" : "Phù hợp thấp"}
                                    </span>
                                  </div>
                                </div>
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black border shadow-inner ${
                                  app.matchLevel === "HIGH" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                  app.matchLevel === "MEDIUM" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                  "bg-red-50 text-red-500 border-red-100"
                                }`}>
                                  {app.matchScore}
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleMatch(app.id)}
                                disabled={matchingId !== null}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-1.5 px-3 rounded-lg gap-1.5 flex items-center h-8 transition-colors"
                              >
                                {matchingId === app.id ? (
                                  <>
                                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                                    Đang phân tích...
                                  </>
                                ) : (
                                  <>
                                    <Brain className="h-3.5 w-3.5 text-indigo-400" />
                                    Phân tích AI
                                  </>
                                )}
                              </Button>
                            )}

                          </div>
                        </div>

                        {/* Collapsible AI Feedback */}
                        {app.matchScore !== null && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => setExpandedFeedbackId(isExpanded ? null : app.id)}
                              className="text-xs text-gray-500 hover:text-blue-600 font-semibold flex items-center gap-1 select-none"
                            >
                              {isExpanded ? (
                                <>
                                  Thu gọn đánh giá AI
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </>
                              ) : (
                                <>
                                  Xem chi tiết đánh giá AI
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-4 rounded-xl border border-gray-200/60 text-xs text-gray-700 leading-relaxed relative">
                                <Brain className="absolute top-3 right-3 text-indigo-100 h-10 w-10 pointer-events-none" />
                                <div className="font-semibold text-indigo-900 mb-1.5 flex items-center gap-1">
                                  <span>🤖 Nhận xét từ AI:</span>
                                </div>
                                <p className="relative z-10 text-gray-600 leading-relaxed">
                                  {app.aiFeedback || "Đang cập nhật đánh giá..."}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
