"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Loader2 } from "lucide-react";
import { applicationService } from "@/services/applicationService";
import { authService } from "@/lib/auth-service";

interface CV {
  id: string;
  title: string;
  cvUrl: string;
  status: string;
}

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  onSuccess?: () => void;
}

export function ApplyJobModal({ isOpen, onClose, jobId, jobTitle, onSuccess }: ApplyJobModalProps) {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingCvs, setFetchingCvs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCVs();
    }
  }, [isOpen]);

  const fetchCVs = async () => {
    try {
      setFetchingCvs(true);
      const token = authService.getToken();
      if (!token) {
        setError("Vui lòng đăng nhập");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/candidates/my-cvs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CVs');
      }

      const data = await response.json();
      setCvs(data.filter((cv: CV) => cv.status === 'DONE'));
      
      if (data.length > 0) {
        setSelectedCvId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch CVs:', err);
      setError('Không thể tải danh sách CV');
    } finally {
      setFetchingCvs(false);
    }
  };

  const handleApply = async () => {
    if (!selectedCvId) {
      setError("Vui lòng chọn CV");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        setError("Vui lòng đăng nhập");
        return;
      }

      await applicationService.applyToJob(
        { jobId, cvId: selectedCvId },
        token
      );

      alert("Ứng tuyển thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to apply:', err);
      setError(err.message || "Có lỗi xảy ra khi ứng tuyển");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ứng tuyển công việc</DialogTitle>
          <DialogDescription>
            {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {fetchingCvs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-500">Đang tải CV...</span>
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">
                Bạn chưa có CV nào. Vui lòng tạo CV trước khi ứng tuyển.
              </p>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          ) : (
            <>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Chọn CV để ứng tuyển
                </Label>
                <RadioGroup value={selectedCvId} onValueChange={setSelectedCvId}>
                  <div className="space-y-2">
                    {cvs.map((cv) => (
                      <div
                        key={cv.id}
                        className="flex items-center space-x-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <RadioGroupItem value={cv.id} id={cv.id} />
                        <Label
                          htmlFor={cv.id}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{cv.title}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading || !selectedCvId}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Ứng tuyển ngay"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
