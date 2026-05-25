"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { savedJobService } from "@/services/savedJobService";
import { applicationService } from "@/services/applicationService";
import { authService } from "@/lib/auth-service";
import { ApplyJobModal } from "./ApplyJobModal";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface JobActionButtonsProps {
  jobId: string;
  jobTitle: string;
  variant?: "default" | "compact";
}

export function JobActionButtons({ jobId, jobTitle, variant = "default" }: JobActionButtonsProps) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setCheckingStatus(true);
      return;
    }

    if (user && user.role === 'CANDIDATE') {
      checkJobStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [user, token, isLoading, jobId]);

  const checkJobStatus = async () => {
    if (!token) {
      setCheckingStatus(false);
      return;
    }

    setCheckingStatus(true);
    try {
      const [savedStatus, appliedStatus] = await Promise.all([
        savedJobService.checkIfSaved(jobId, token),
        applicationService.checkIfApplied(jobId, token),
      ]);

      setIsSaved(savedStatus);
      setIsApplied(appliedStatus);
    } catch (error) {
      console.error('Failed to check job status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể lưu công việc');
      return;
    }

    setSavingJob(true);
    try {
      const token = authService.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      if (isSaved) {
        await savedJobService.unsaveJob(jobId, token);
        setIsSaved(false);
      } else {
        await savedJobService.saveJob(jobId, token);
        setIsSaved(true);
      }
    } catch (error: any) {
      console.error('Failed to toggle save:', error);
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setSavingJob(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }

    if (isApplied) {
      toast.error('Bạn đã ứng tuyển công việc này rồi');
      return;
    }

    setShowApplyModal(true);
  };

  const handleApplySuccess = () => {
    setIsApplied(true);
  };

  if (!user || user.role !== 'CANDIDATE') {
    return null;
  }

  if (checkingStatus) {
    return (
      <div className="flex gap-2">
        <Button disabled className="flex-1">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Đang tải...
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToggle}
            disabled={savingJob}
            className={isSaved ? "border-blue-600 text-blue-600" : ""}
          >
            {savingJob ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleApplyClick}
            disabled={isApplied}
            className={isApplied ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}
          >
            {isApplied ? "Đã ứng tuyển" : "Ứng tuyển"}
          </Button>
        </div>

        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          jobId={jobId}
          jobTitle={jobTitle}
          onSuccess={handleApplySuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleSaveToggle}
          disabled={savingJob}
          className={`flex-1 ${isSaved ? "border-blue-600 text-blue-600" : ""}`}
        >
          {savingJob ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
          )}
          {isSaved ? "Đã lưu" : "Lưu tin"}
        </Button>
        <Button
          onClick={handleApplyClick}
          disabled={isApplied}
          className={`flex-1 ${isApplied ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          <Send className="h-4 w-4 mr-2" />
          {isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
        </Button>
      </div>

      <ApplyJobModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobId={jobId}
        jobTitle={jobTitle}
        onSuccess={handleApplySuccess}
      />
    </>
  );
}
