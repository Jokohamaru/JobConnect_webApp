"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, BookmarkPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Candidate, MatchLevel } from "@/app/recruiter/candidates/page";

const matchConfig: Record<
  MatchLevel,
  { bg: string; text: string; dot: string }
> = {
  "Phù hợp cao": {
    bg: "bg-green-50 border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  "Phù hợp trung bình": {
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-600",
    dot: "bg-orange-400",
  },
  "Phù hợp thấp": {
    bg: "bg-red-50 border-red-200",
    text: "text-red-600",
    dot: "bg-red-400",
  },
};

interface CandidateCardProps {
  candidate: Candidate;
  /** 0-based index in the grid – used to decide popup direction */
  index?: number;
}

export function CandidateCard({ candidate, index = 0 }: CandidateCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const match = matchConfig[candidate.matchLevel];
  // Last column (3rd of 0-indexed 4-col grid) → open popup to the LEFT
  const popupLeft = index % 4 !== 3;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Base Card */}
      <div
        className={cn(
          "bg-white rounded-xl border border-gray-200 p-4 shadow-sm transition-all duration-200 cursor-pointer",
          hovered && "shadow-lg border-blue-200 -translate-y-0.5",
        )}
      >
        {/* Match Badge */}
        <div className="flex justify-end mb-2">
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2 py-0.5",
              match.bg,
              match.text,
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", match.dot)} />
            {candidate.matchLevel}
          </span>
        </div>

        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center mb-3">
          <div className="relative mb-2">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=3b82f6&color=fff`;
              }}
            />
          </div>
          <div className="text-3xl font-black text-gray-800 leading-none">
            {candidate.matchScore}%
          </div>
          <div className="text-[11px] text-gray-400 font-medium mb-1">
            AI Match
          </div>
          <div className="font-semibold text-gray-800 text-sm">
            {candidate.name}
          </div>
          <div className="text-xs text-gray-500">{candidate.role}</div>
          <div className="text-xs text-gray-400">{candidate.experience}</div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 justify-center mb-3">
          {candidate.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium border border-blue-100"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px]">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-around border-t border-gray-100 pt-3 mt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/recruiter/cv/${candidate.id}`);
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
              <FileText className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
            </div>
            <span className="text-[10px] text-gray-500">Xem CV</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
              <Calendar className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
            </div>
            <span className="text-[10px] text-gray-500">Hẹn PV</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
              <BookmarkPlus className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
            </div>
            <span className="text-[10px] text-gray-500">Lưu hồ sơ</span>
          </button>
        </div>
      </div>

      {/* Hover Popup */}
      {hovered && (
        <div
          className={cn(
            "absolute z-50 w-75 bg-white rounded-xl border border-blue-100 shadow-2xl p-4 top-2",
            popupLeft ? "left-full ml-2" : "right-full mr-2"
          )}
          style={{
            maxHeight: "480px",
            overflowY: "auto",
            animation: "candidatePopupIn 0.15s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=3b82f6&color=fff`;
              }}
            />
            <div>
              <div className="font-bold text-gray-900 text-sm">
                {candidate.name}
              </div>
              <div className="text-xs text-gray-500">{candidate.role}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {/* Match badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2 py-0.5 mt-1",
                  match.bg,
                  match.text,
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", match.dot)} />
                {candidate.matchLevel} – {candidate.matchScore}%
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              {candidate.summary}
            </p>
          </div>

          {/* Work History */}
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Kinh nghiệm làm việc
            </div>
            {candidate.workHistory.map((w, i) => (
              <div key={i} className="text-xs text-gray-700">
                <span className="font-medium">{w.company}</span>
                <span className="text-gray-400 ml-1">{w.period}</span>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mb-3">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Học vấn
            </div>
            <div className="text-xs text-gray-700">{candidate.education}</div>
          </div>

          {/* Skill Scores */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Kỹ năng nổi bật
            </div>
            <div className="space-y-1.5">
              {candidate.skillScores.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-16 text-xs text-gray-600 shrink-0">
                    {s.name}
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-[11px] text-gray-500">
                    {s.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs border-gray-200 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/recruiter/cv/${candidate.id}`);
              }}
            >
              Xem CV
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Hẹn phỏng vấn
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-gray-200 hover:bg-gray-50"
            >
              Lưu hồ sơ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
