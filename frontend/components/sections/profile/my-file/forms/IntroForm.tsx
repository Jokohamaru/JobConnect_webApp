import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormProps } from "../sections/types";

export default function IntroForm({data, setData} : FormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Giới thiệu ngắn</Label>
        <Textarea
        value={data.title}
        onChange={(e) => setData({...data, title: e.target.value})}
          placeholder="Viết vài câu giới thiệu điểm mạnh và định hướng nghề nghiệp..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}