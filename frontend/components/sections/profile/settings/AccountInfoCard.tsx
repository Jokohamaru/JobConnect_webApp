// components/AccountInfoCard.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, ChevronRight } from "lucide-react";

interface AccountInfoCardProps {
  email: string;
  fullName: string;
}

function InfoRow({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <span className="text-sm font-bold text-muted-foreground w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{value}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="w-3 h-3 shrink-0" />
          {hint}
        </p>
        {children}
      </div>
    </div>
  );
}

export function AccountInfoCard({ email, fullName }: AccountInfoCardProps) {
  return (
    <Card className="shadow-sm bg-white mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Thông tin tài khoản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <InfoRow
          label="Email:"
          value={email}
          hint="Không thể thay đổi email đăng nhập."
        >
          <Badge variant="secondary" className="w-fit text-xs">
            Google
          </Badge>
        </InfoRow>

        <Separator />

        <InfoRow
          label="Họ và Tên:"
          value={fullName}
          hint="Tên tài khoản được đồng bộ với thông tin hồ sơ."
        >
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
            asChild
          >
            <Link href="/profile/my-file">
              Cập nhật thông tin hồ sơ
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </Button>
        </InfoRow>
      </CardContent>
    </Card>
  );
}