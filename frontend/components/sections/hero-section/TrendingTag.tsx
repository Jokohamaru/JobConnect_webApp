"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Tag {
  id: string;
  name: string;
}

const FALLBACK_TAGS: Tag[] = [
  { id: "1", name: "IT - Phần mềm" },
  { id: "2", name: "Tài chính - Ngân hàng" },
  { id: "3", name: "Marketing" },
  { id: "4", name: "Chăm sóc khách hàng" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function TrendingTag() {
  const [tags, setTags] = useState<Tag[]>(FALLBACK_TAGS);

  useEffect(() => {
    fetch(`${API_URL}/tags`)
      .then((res) => res.json())
      .then((data: Tag[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Lấy ngẫu nhiên 4 tags từ toàn bộ dữ liệu
          setTags(pickRandom(data, 4));
        }
      })
      .catch(() => {
        // Keep fallback tags if fetch fails
      });
  }, []);

  return (
    <div className="flex items-center gap-3 text-[13px] justify-center">
      <span className="bg-[#0b4a85] text-white font-medium px-4 py-1.5 rounded-full shrink-0">
        Xu hướng hiện nay:
      </span>

      {tags.map((tag) => (
        <Link
          href={`/searching?tagNames=${encodeURIComponent(tag.name)}`}
          key={tag.id}
          className="bg-white px-4 py-1.5 rounded-full text-gray-700 hover:bg-gray-100 transition-colors font-medium whitespace-nowrap"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
