// components/careers/CareerCard.tsx
import Image from 'next/image';

interface CareerCardProps {
  icon: string;
  title: string;
  jobCount: number;
}

export default function CareerCard({ icon, title, jobCount }: CareerCardProps) {
  return (
    <div className="group relative bg-[#EDFBFE] border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-400 hover:bg-white transition-all duration-300 cursor-pointer">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 flex items-center justify-center bg-[#EDFBFE] rounded-full shadow-md">
          <Image
            src={icon || "https://i.pravatar.cc/40"}
            alt={title}
            width={50}
            height={50}
            className="object-contain"
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-center font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[48px]">
        {title}
      </h3>

      {/* Job Count */}
      <p className="text-center text-blue-500 text-sm font-medium">
        {jobCount.toLocaleString('vi-VN')} việc làm
      </p>
    </div>
  );
}