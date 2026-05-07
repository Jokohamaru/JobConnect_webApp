"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockCandidates } from "@/lib/data/mock-data";
import { StatusBadge } from "./status-badge";
import { Eye, Edit, CheckCircle, RefreshCcw, Trash2, UserPlus } from "lucide-react";

interface JobsTableProps {
  onAddUser?: () => void;
}

export function JobsTable({ onAddUser }: JobsTableProps) {
  return (
    <Card className="shadow-sm border-none overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Kiểm duyệt ứng viên</CardTitle>
          <Button
            onClick={onAddUser}
            className="flex items-center gap-2 bg-[#0E7BC3] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            Thêm người dùng
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600">
                  Mã ứng viên
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Tên ứng viên
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Chuyên môn
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Trạng thái
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-600">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCandidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <TableCell className="font-medium text-gray-900">
                    {candidate.id}
                  </TableCell>
                  <TableCell
                    className="font-medium text-blue-600 max-w-[250px] truncate"
                    title={candidate.name}
                  >
                    {candidate.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {candidate.expertise}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={candidate.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-blue-600 bg-white hover:bg-blue-50 shadow-sm border border-gray-100"
                        title="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-amber-600 bg-white hover:bg-amber-50 shadow-sm border border-gray-100"
                        title="Sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {candidate.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-emerald-600 bg-white hover:bg-emerald-50 shadow-sm border border-gray-100"
                          title="Duyệt"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {candidate.status === "expired" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-blue-600 bg-white hover:bg-blue-50 shadow-sm border border-gray-100"
                          title="Gia hạn"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 bg-white hover:bg-red-50 shadow-sm border border-gray-100"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
