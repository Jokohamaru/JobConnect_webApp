import { CVTemplate } from "@/components/sections/cv-page/CVTemplateCard";

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: 1,
    name: "Tiêu chuẩn",
    image: "/images/cvtemplate1.jpg",
    tags: ["ATS", "Đơn giản"],
    isNew: false,
    downloads: 12400,
  },
  {
    id: 2,
    name: "Tiêu chuẩn (ít kinh nghiệm)",
    image: "/images/cvtemplate2.jpg",
    tags: ["ATS", "Đơn giản", "Chuyên nghiệp"],
    isNew: true,
    downloads: 8750,
  },
  {
    id: 3,
    name: "Thanh lịch",
    image: "/images/cvtemplate3.jpg",
    tags: ["ATS", "Hiện đại"],
    isNew: false,
    downloads: 9300,
  },
];
