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
interface MenuItemProps{
    icon: any,
    label: string,
    onClick: () => void
}
function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <Button
      onClick={onClick}
      className="w-full flex justify-start  gap-3 px-3 py-5  transition hover:bg-[#B4D6EC]"
        
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}

export default function MenuList() {
  const router = useRouter();


  return (
    <div >
      <MenuItem
        icon={<Menu size={18} />}
        label="Tổng quan"
        onClick={() => router.push("/dashboard")}
      
      />

      <MenuItem
        icon={<User size={18} />}
        label="Hồ sơ của tôi"
        onClick={() => router.push("/profile")}
      />

      <MenuItem
        icon={<Briefcase size={18} />}
        label="Việc làm của tôi"
        onClick={() => router.push("/jobs")}
      />

      <MenuItem
        icon={<FileText size={18} />}
        label="Hồ sơ đính kèm"
        onClick={() => router.push("/cv")}
      />

      <MenuItem
        icon={<Mail size={18} />}
        label="Lời mời công việc"
        onClick={() => router.push("/invites")}
      />


      <MenuItem
        icon={<Settings size={18} />}
        label="Cài đặt"
        onClick={() => router.push("/settings")}
      />

      <MenuItem
        icon={<LogOut size={18} />}
        label="Đăng xuất"
        onClick={() => {}}
      />
    </div>
  );
}