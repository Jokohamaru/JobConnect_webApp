"use client";

// components/CVSearchCard.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Search } from "lucide-react";

interface CVSearchCardProps {
  enabled: boolean;
  onToggle: () => void;
  blockedCompanies?: string[];
}

const MAX_BLOCKED = 5;

export function CVSearchCard({
  enabled,
  onToggle,
  blockedCompanies: initialBlocked = [],
}: CVSearchCardProps) {
  const [query, setQuery] = useState("");
  const [blocked, setBlocked] = useState<string[]>(initialBlocked);

  function addCompany() {
    const trimmed = query.trim();
    if (!trimmed || blocked.includes(trimmed) || blocked.length >= MAX_BLOCKED)
      return;
    setBlocked((prev) => [...prev, trimmed]);
    setQuery("");
  }

  function removeCompany(name: string) {
    setBlocked((prev) => prev.filter((c) => c !== name));
  }

  return (
    <Card className="shadow-sm bg-white mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-semibold">
            Cho phép tìm kiếm CV
          </CardTitle>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-blue-600 shrink-0"
            asChild
          >
            <a href="#" target="_blank" rel="noreferrer">
              Tìm hiểu thêm
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        {/* Toggle row */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cho phép nhà tuyển dụng tìm kiếm CV ẩn danh của bạn và gửi lời mời
            công việc qua email, SMS và ITviec Inbox.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              id="cv-search-toggle"
              checked={enabled}
              onCheckedChange={() => onToggle()}

            />
            <Label
              htmlFor="cv-search-toggle"
              className={`text-sm font-semibold cursor-pointer select-none ${
                enabled ? "text-blue-500" : "text-blue-500"
              }`}
            >
              {enabled ? "Bật" : "Tắt"}
            </Label>
          </div>
        </div>

        <Separator />

        {/* Block companies */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-foreground">
              Không nhận lời mời công việc từ:
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tối đa {MAX_BLOCKED} nhà tuyển dụng
            </p>
          </div>

          {/* Search input */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompany()}
                placeholder="Tìm kiếm công ty"
                className="pl-9 text-sm"
                disabled={blocked.length >= MAX_BLOCKED}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addCompany}
              disabled={!query.trim() || blocked.length >= MAX_BLOCKED}
              className="shrink-0"
            >
              Thêm
            </Button>
          </div>

          {/* Blocked company tags */}
          {blocked.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blocked.map((company) => (
                <Badge
                  key={company}
                  variant="secondary"
                  className="flex items-center gap-1.5 pr-1.5 text-sm"
                >
                  {company}
                  <button
                    type="button"
                    onClick={() => removeCompany(company)}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                    aria-label={`Xoá ${company}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Chưa chọn công ty nào
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
