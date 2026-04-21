'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useState } from "react";


export default function SkillForm() {
  const [skills, setSkills] = useState<string[]>(["React", "Node.js", "Thiết kế UI/UX"]);
  const [input, setInput] = useState("");
 
  const addSkill = () => {
    const val = input.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setInput("");
    }
  };
 
  const removeSkill = (s: string) => setSkills(skills.filter((k) => k !== s));
 
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Thêm kỹ năng</Label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="VD: React, Python, Quản lý dự án..."
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
          />
          <Button type="button" onClick={addSkill} className="bg-rose-500 hover:bg-rose-600 text-white shrink-0">
            + Thêm
          </Button>
        </div>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer gap-1 pl-3 pr-2"
              onClick={() => removeSkill(s)}
            >
              {s}
              <X className="w-3 h-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}