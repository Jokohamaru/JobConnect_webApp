import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function EduForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Trường / Cơ sở đào tạo</Label>
        <Input placeholder="VD: Đại học Bách Khoa Hà Nội" />
      </div>
      <div className="space-y-1.5">
        <Label>Chuyên ngành</Label>
        <Input placeholder="VD: Công nghệ thông tin" />
      </div>
      <div className="space-y-1.5">
        <Label>Bằng cấp / Trình độ</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="-- Chọn --" />
          </SelectTrigger>
          <SelectContent>
            {["Trung cấp", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ"].map(
              (d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Năm bắt đầu</Label>
          <Input type="number" placeholder="VD: 2018" />
        </div>
        <div className="space-y-1.5">
          <Label>Năm kết thúc</Label>
          <Input type="number" placeholder="VD: 2022" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Mô tả thêm (tùy chọn)</Label>
        <Textarea placeholder="Thành tích nổi bật, luận văn, hoạt động..." />
      </div>
    </div>
  );
}