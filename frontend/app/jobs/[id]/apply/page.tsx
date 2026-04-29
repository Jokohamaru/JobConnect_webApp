'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobById, Job } from '@/lib/api/jobs';
import { getMyCVs, CV } from '@/lib/api/cvs';
import { createApplication } from '@/lib/api/applications';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, FileText, CheckCircle2 } from 'lucide-react';

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/jobs/' + params.id + '/apply');
      return;
    }
    loadData();
  }, [isAuthenticated, params.id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load job details
      const jobResponse = await getJobById(params.id as string);
      if (jobResponse.error || !jobResponse.data) {
        setError('Không thể tải thông tin việc làm');
        return;
      }
      setJob(jobResponse.data);

      // Load user's CVs
      const cvsResponse = await getMyCVs();
      if (cvsResponse.error) {
        setError('Không thể tải danh sách CV');
        return;
      }
      
      if (cvsResponse.data && cvsResponse.data.length > 0) {
        setCvs(cvsResponse.data);
        // Auto-select default CV or first CV
        const defaultCV = cvsResponse.data.find(cv => cv.is_default);
        setSelectedCvId(defaultCV?.id || cvsResponse.data[0].id);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCvId) {
      showToast('Vui lòng chọn CV để ứng tuyển', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createApplication(params.id as string, selectedCvId);
      
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }

      showToast('Ứng tuyển thành công! Chúc bạn may mắn.', 'success');
      router.push('/applications');
    } catch (err) {
      showToast('Không thể gửi đơn ứng tuyển', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/jobs">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/jobs/${params.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ứng tuyển</h1>
          <p className="text-gray-600 mb-6">Hoàn tất đơn ứng tuyển của bạn</p>

          {/* Job Info */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
            <p className="text-gray-700">{job.company.name}</p>
            <p className="text-gray-600 text-sm mt-1">{job.location}</p>
          </div>

          {cvs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bạn chưa có CV nào
              </h3>
              <p className="text-gray-600 mb-4">
                Vui lòng tải lên CV trước khi ứng tuyển
              </p>
              <Link href="/profile/cvs">
                <Button>Tải lên CV</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <Label className="text-lg font-semibold mb-4 block">
                  Chọn CV để ứng tuyển
                </Label>
                <div className="space-y-3">
                  {cvs.map((cv) => (
                    <div
                      key={cv.id}
                      onClick={() => setSelectedCvId(cv.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedCvId === cv.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className={`w-5 h-5 ${
                            selectedCvId === cv.id ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{cv.file_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        {selectedCvId === cv.id && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        )}
                        {cv.is_default && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            Mặc định
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting || !selectedCvId}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi đơn ứng tuyển'
                  )}
                </Button>
                <Link href={`/jobs/${params.id}`}>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
