
import { Check } from 'lucide-react';

const benefits = [
  'Khám phá mức lương dựa trên vị trí địa bạn có thể tự tin đàm phán.',
  'Khám phá lợi ích, văn hóa và môi trường làm việc của công ty thông qua đánh giá xác thực từ những người đã từng ở đó.',
  'Ứng tuyển chỉ với một cú nhấp chuột - nhanh chóng, đơn giản và liền mạch.',
  'Kiểm soát hoàn toàn hồ sơ và quyền riêng tư của bạn.'
];

export default function LoginBenefits() {
  return (
    <div className="flex flex-col justify-center ml-10 lg:min-w-135 xl:min-w-170 w-full">
      <h2 className="text-3xl font-bold mb-10 text-[#1F88C7] text-center ">
        Đăng nhập để truy cập vào thông tin chi tiết về thị trường việc làm được cá nhân hóa!
      </h2>

      <div className="space-y-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="shrink-0 w-6 h-6  rounded-full flex items-center justify-center mt-1">
              <Check className="w-7 h-7 text-green-500" />
            </div>
            <p className="text-lg leading-relaxed">{benefit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}