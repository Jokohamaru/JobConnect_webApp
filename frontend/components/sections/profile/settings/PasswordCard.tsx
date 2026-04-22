// components/PasswordCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function PasswordCard() {
  return (
    <Card className="shadow-sm bg-white mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Mật khẩu</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Alert variant="default" className="border-muted bg-muted/40">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            Không có mật khẩu đối với tài khoản đăng ký bằng Google.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}