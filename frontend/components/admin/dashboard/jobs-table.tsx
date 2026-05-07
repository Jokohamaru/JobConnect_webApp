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
import { mockJobs } from "@/lib/data/mock-data";
import { StatusBadge } from "./status-badge";
import { Eye, Edit, CheckCircle, RefreshCcw, Trash2 } from "lucide-react";

export function JobsTable() {
  return (
    <Card className="shadow-sm border-none overflow-hidden bg-white">
      <CardHeader className="bg-white border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-bold">Danh sách Việc làm</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600">
                  Mã Việc
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Tiêu đề
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Nhà tuyển dụng
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Trạng thái
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Ngày đăng
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-600">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockJobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <TableCell className="font-medium text-gray-900">
                    {job.id}
                  </TableCell>
                  <TableCell
                    className="font-medium text-blue-600 max-w-[250px] truncate"
                    title={job.title}
                  >
                    {job.title}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {job.employer}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-gray-500">{job.date}</TableCell>
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
                      {job.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-emerald-600 bg-white hover:bg-emerald-50 shadow-sm border border-gray-100"
                          title="Duyệt"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === "expired" && (
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
