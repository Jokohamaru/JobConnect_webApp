import Link from "next/link";
import { ReactNode } from "react";

interface Stat {
  id: number;
  label: string;
  value: number;
  icon: ReactNode;
  bgColor: string;
  iconColor: string;
  link: ReactNode
}

const stats: Stat[] = [
  {
    id: 1,
    label: 'Việc làm đã ứng tuyển',
    value: 0,
    icon: <img src="/images/ll.png"/>,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    link: <Link href="/profile/my-jobs"></Link>
  },
  {
    id: 2,
    label: 'Việc làm đã lưu',
    value: 1,
    icon: <img src="/images/tym.png"/>,
    bgColor: 'bg-pink-50',
    iconColor: 'text-pink-500',
    link: <Link href="/profile/my-jobs"></Link>
  },
  {
    id: 3,
    label: 'Lời mời công việc',
    value: 2,
    icon: <img src="/images/letter.png"/>,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
    link: <Link href="/profile/invites"></Link>
  },
];

export default function ActivityStats() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Hoạt động của bạn
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bgColor} relative rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer min-h-[150px]`}
          >
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-800">
                {stat.value} 
              </span>
              <span className="text-3xl absolute w-15 h-15 left-60 bottom-5">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}