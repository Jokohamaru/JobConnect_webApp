import Link from 'next/link';
import { Job } from '@/lib/api/jobs';
import { MapPin, DollarSign, Briefcase, Clock, Building2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(0)}M`;
      }
      return num.toLocaleString('vi-VN');
    };
    return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return `${Math.floor(diffInDays / 30)} tháng trước`;
  };

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
        {/* Company Logo & Header */}
        <div className="flex items-start gap-4 mb-4">
          {job.company.logo_url ? (
            <img 
              src={job.company.logo_url} 
              alt={job.company.name}
              className="w-14 h-14 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">{job.company.name}</p>
          </div>
        </div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-semibold text-green-600">
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <Briefcase className="w-4 h-4 mr-2" />
            <span>{job.job_type}</span>
          </div>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
              >
                {tag.tag.name}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{job.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-500 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            <span>{getTimeAgo(job.created_at)}</span>
          </div>
          <span className="text-blue-600 text-sm font-medium hover:underline">
            Xem chi tiết →
          </span>
        </div>
      </div>
    </Link>
  );
}
