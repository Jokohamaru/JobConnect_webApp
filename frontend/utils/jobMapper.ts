import { Job } from '@/types/job';
import { JobCardProps } from '@/components/sections/jobs/JobCard';

export function mapJobToJobCard(job: Job): JobCardProps {
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
  } else if (job.maxSalary) {
    salary = `Lên đến ${job.currency === 'VND' ? `${(job.maxSalary / 1000000).toFixed(0)} triệu` : `$${job.maxSalary.toLocaleString()}`}`;
  }

  // Format deadline (example: 30 days from now)
  const deadline = new Date(job.createdAt);
  deadline.setDate(deadline.getDate() + 30);
  const formattedDeadline = deadline.toLocaleDateString('vi-VN');

  return {
    slugJob: job.id,
    slugCompany: job.company.id,
    nameJob: job.title,
    nameCompany: job.company.name,
    logoCompanyURL: job.company.logoUrl || '',
    salary,
    locate: job.city.name,
    deadline: formattedDeadline,
    experience: 'Không yêu cầu', // Default, có thể thêm field này vào schema sau
    descriptions: [job.description],
    requests: job.skills.map(skill => skill.name),
    benefits: [], // Có thể thêm field này vào schema sau
    address: [job.city.name],
  };
}
