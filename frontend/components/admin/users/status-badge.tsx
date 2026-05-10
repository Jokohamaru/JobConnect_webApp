interface StatusBadgeProps {
  status: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    ACTIVE: {
      label: "Hoạt động",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    PENDING: {
      label: "Chờ duyệt",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    BANNED: {
      label: "Bị cấm",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    DELETED: {
      label: "Đã xóa",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
