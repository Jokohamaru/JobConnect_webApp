import { Button } from "@/components/ui/button";
import {
  Menu,
  User,
  Briefcase,
  FileText,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface MenuItemProps {
  icon: any;
  label: string;
  onClick: () => void;
}
interface MenuListProps {
  onClose: () => void 
}
function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <Button
      onClick={onClick}
      className={`w-full flex justify-start gap-3 px-3 py-5 transition 
      hover:bg-[#B4D6EC]
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}

export default function MenuList({ onClose }: MenuListProps) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="relative z-100">
      <MenuItem
        icon={<Menu size={18} />}
        label="Tổng quan"
        onClick={() => {
          router.push("/profile/dashboard");
          onClose();
        }}
       
      />

      <MenuItem
        icon={<User size={18} />}
        label="Hồ sơ của tôi"
        onClick={() => {
          router.push("/profile/my-file");
          onClose();
        }}

      />

      <MenuItem
        icon={<Briefcase size={18} />}
        label="Việc làm của tôi"
        onClick={() => {
          router.push("/profile/my-jobs")
          onClose()
        }}
    
      />

      <MenuItem
        icon={<FileText size={18} />}
        label="Hồ sơ đính kèm"
        onClick={() => {
          router.push("/profile/cv-attachment")
          onClose()
        }}

      />

      <MenuItem
        icon={<Mail size={18} />}
        label="Lời mời công việc"
        onClick={() => {
          router.push("/profile/invites")
          onClose()
        }}

      />

      <MenuItem
        icon={<Settings size={18} />}
        label="Cài đặt"
        onClick={() => {
          router.push("/profile/settings")
          onClose()
        }}

      />

      <MenuItem
        icon={<LogOut size={18} />}
        label="Đăng xuất"
        onClick={() => {
          logout();
          onClose();
          router.push("/");
        }}
      />
    </div>
  );
}
