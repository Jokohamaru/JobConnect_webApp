// components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Send } from "lucide-react";
import { FaLinkedinIn, FaFacebookF, FaYoutube } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  {
    heading: "Về ITviec",
    links: [
      { label: "Trang Chủ", href: "/" },
      { label: "Về ITviec.com", href: "/about" },
      { label: "Dịch vụ gợi ý ứng viên", href: "/services" },
      { label: "Liên Hệ", href: "/contact" },
      { label: "Việc Làm IT", href: "/jobs" },
      { label: "Câu hỏi thường gặp", href: "/faq" },
    ],
  },
  {
    heading: "Chương trình",
    links: [
      { label: "Chuyện IT", href: "/blog" },
      { label: "Cuộc thi viết", href: "/writing-contest" },
      { label: "Việc làm IT nổi bật", href: "/featured-jobs" },
      { label: "Khảo sát thường niên", href: "/survey" },
    ],
  },
  {
    heading: "Điều khoản chung",
    links: [
      { label: "Chính sách quyền riêng tư", href: "/privacy" },
      { label: "Quy chế hoạt động", href: "/rules" },
      { label: "Giải quyết khiếu nại", href: "/complaints" },
      { label: "Thoả thuận sử dụng", href: "/terms" },
      { label: "Thông cáo báo chí", href: "/press" },
    ],
  },
];

const contactItems = [
  {
    icon: <Phone className="w-4 h-4 shrink-0 text-red-400" />,
    content: "Hồ Chí Minh: (+84) 977 460 519",
  },
  {
    icon: <Phone className="w-4 h-4 shrink-0 text-red-400" />,
    content: "Hà Nội: (+84) 983 131 351",
  },
  {
    icon: <Mail className="w-4 h-4 shrink-0 text-red-400" />,
    content: "Email: love@itviec.com",
    href: "mailto:love@itviec.com",
  },
  {
    icon: <Send className="w-4 h-4 shrink-0 text-red-400" />,
    content: "Gửi thông tin liên hệ",
    href: "/contact",
  },
];

const socialLinks = [
  {
    icon: <FaLinkedinIn className="w-4 h-4" />,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: <FaFacebookF className="w-4 h-4" />,
    href: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: <FaYoutube className="w-4 h-4" />,
    href: "https://youtube.com",
    label: "YouTube",
  },
];

export function Footer() {
  return (
    <footer className=" bg-linear-to-r from-[#7794b6]  to-[#dffaff] text-gray-300 relative overflow-hidden ">
      {/* Decorative background lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        aria-hidden
        style={{
          backgroundImage:
            " bg-linear-to-r from-[#9358f7] via-[#6197ee] to-[#10d7e2] ",
        }}
      />

      <div className="relative max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">

          {/* Left — Logo + tagline + socials */}
          <div className="flex flex-col gap-6">
            {/* Replace with your own <Image> */}
            <div className="w-36">
              <Image
                src="/images/Logo_Job_Connect_3-removebg-preview.png"
                alt="ITviec logo"
                width={144}
                height={40}
                className="object-contain "
              />
            </div>


            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-blue-500 hover:border-red-500 hover:text-red-400 transition-colors"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — Link columns + contact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {footerLinks.map(({ heading, links }) => (
              <div key={heading}>
                <h3 className="text-black font-semibold text-sm mb-4">
                  {heading}
                </h3>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm text-black hover:text-blue-500 transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact column */}
            <div>
              <h3 className="text-black font-semibold text-sm mb-4">
                Liên hệ để đăng tin tuyển dụng tại:
              </h3>
              <ul className="space-y-3">
                {contactItems.map(({ icon, content, href }) => (
                  <li key={content}>
                    {href ? (
                      <Link
                        href={href}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-red-400 transition-colors"
                      >
                        {icon}
                        <span>{content}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2 text-sm text-blue-400">
                        {icon}
                        <span>{content}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <Separator className="mt-10 mb-5 bg-gray-700/50" />
        <p className="text-center text-xs text-gray-500">
          Copyright © IT VIEC JSC &nbsp;|&nbsp; MST: 0312192258
        </p>
      </div>
    </footer>
  );
}