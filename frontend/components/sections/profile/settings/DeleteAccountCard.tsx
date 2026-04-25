"use client";

// components/DeleteAccountCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

interface DeleteAccountCardProps {
  onDelete?: () => void;
}

export function DeleteAccountCard({ onDelete }: DeleteAccountCardProps) {
  return (
    <Card className="shadow-sm border-destructive/20 bg-white mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Xoá tài khoản</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <Alert
          variant="destructive"
          className="bg-destructive/5 border-destructive/20"
        >
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            Thao tác xóa tài khoản là vĩnh viễn và không thể hoàn tác.
          </AlertDescription>
        </Alert>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-700 px-5 py-5 border-2 hover:bg-blue-200 hover:text-blue-700"
            >
              Xoá tài khoản
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Bạn có chắc chắn muốn xoá?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Tài khoản của bạn và toàn bộ
                dữ liệu liên quan sẽ bị xoá vĩnh viễn khỏi hệ thống.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className=" bg-red-500 px-5 py-5 border-none hover:bg-red-400 cursor-pointer">Huỷ</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className=" bg-blue-500 p-5 hover:bg-blue-400 cursor-pointer"
              >
                Xác nhận xoá
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
