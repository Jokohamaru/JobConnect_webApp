interface RoleBadgeProps {
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = {
    CANDIDATE: {
      label: "Ứng viên",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    RECRUITER: {
      label: "Nhà tuyển dụng",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    ADMIN: {
      label: "Quản trị viên",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
