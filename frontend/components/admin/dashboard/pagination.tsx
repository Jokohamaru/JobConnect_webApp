import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination() {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-medium text-gray-900">1</span> đến <span className="font-medium text-gray-900">10</span> trong số <span className="font-medium text-gray-900">97</span> kết quả
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" className="h-8 w-8 text-gray-500" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
          1
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 text-gray-600 hover:text-gray-900">
          2
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 text-gray-600 hover:text-gray-900">
          3
        </Button>
        <span className="text-gray-400 px-1">...</span>
        <Button variant="outline" size="sm" className="h-8 w-8 text-gray-600 hover:text-gray-900">
          10
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 text-gray-600 hover:text-gray-900">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
