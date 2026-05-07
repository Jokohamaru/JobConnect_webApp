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
import { mockCategories } from "@/lib/data/mock-data";
import { StatusBadge } from "./status-badge";
import { Eye, Edit, CheckCircle, RefreshCcw, Trash2 } from "lucide-react";

export function JobsTable() {
  return (
    <Card className="shadow-sm border-none overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-100 pb-4">
        <CardTitle className="text-lg font-bold">Danh sách danh mục</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600">
                  Mã danh mục
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Tên ngành nghề
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  Số lượng danh mục
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-600">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCategories.map((categories) => (
                <TableRow
                  key={categories.id}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <TableCell className="font-medium text-gray-900">
                    {categories.id}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {categories.name}
                  </TableCell>
                  <TableCell className="">{categories.count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
