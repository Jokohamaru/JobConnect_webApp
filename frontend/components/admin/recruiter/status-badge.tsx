import { cn } from "@/lib/utils";
import { JobStatus } from "@/lib/data/mock-data";

export function StatusBadge({ status }: { status: JobStatus }) {
  const statusConfig = {
    active: {
      label: "Đang hoạt động",
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    pending: {
      label: "Đang chờ duyệt",
      className: "bg-yellow-50 text-yellow-600 border-yellow-200",
      dotClass: "bg-yellow-500",
    },
    expired: {
      label: "Hết hạn",
      className: "bg-gray-100 text-gray-600 border-gray-200",
      dotClass: "bg-gray-500",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)}></span>
      {config.label}
    </span>
  );
}
