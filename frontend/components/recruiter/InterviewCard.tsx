"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";

interface Interview {
  id: number;
  day: string;
  dayOfWeek: string;
  time: string;
  name: string;
  role: string;
  room: string;
  avatar: string;
}

export function InterviewCard({ interview }: { interview: Interview }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
      {/* Date badge */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shrink-0">
          <span className="text-[10px] font-semibold leading-none">{interview.dayOfWeek}</span>
          <span className="text-xl font-black leading-tight">{interview.day}</span>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {interview.time}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <MapPin className="h-3 w-3" />
            {interview.room}
          </div>
        </div>
      </div>

      {/* Candidate */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={interview.avatar}
          alt={interview.name}
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(interview.name)}&background=3b82f6&color=fff&size=32`;
          }}
        />
        <div>
          <div className="text-sm font-semibold text-gray-800">{interview.name}</div>
          <div className="text-xs text-gray-500">{interview.role}</div>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs border-blue-200 text-blue-600 hover:bg-blue-50 gap-1"
      >
        <Calendar className="h-3 w-3" />
        Xem chi tiết
      </Button>
    </div>
  );
}
