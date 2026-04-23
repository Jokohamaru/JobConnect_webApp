import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ForgotFormProps{
    email: string,
    setEmail: (email: string) => void,
    loading: boolean,
    setLoading: (loading: boolean) => void,
}
export default function ForgotFormField({email, setEmail, loading, setLoading}: ForgotFormProps) {
  return (
    <div className="">
      <div className="flex flex-col gap-5">
        <p className="text-blue-400 font-bold text-2xl" >Quên mật khẩu</p>
        <div>
          <Label className="py-3">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="pl-10" />
          </div>
        </div>
        <p className="text-gray-600">
          Bằng việc thực hiện đổi mật khẩu, bạn đã đồng ý với{" "}
          <Link className="text-blue-500 hover:underline" href="#">Điều khoản dịch vụ</Link> và{" "}
          <Link className="text-blue-500 hover:underline" href="#">Chính sách bảo mật</Link> của chúng tôi
        </p>
        <div className="flex justify-center">
          <Button disabled={loading} className="w-full bg-blue-500 text-white px-6 py-5 hover:bg-blue-600 cursor-pointer">{loading ? "Đang xử lý..." : "Tạo lại mật khẩu"}</Button>
        </div>
        <div className="text-center flex justify-between">
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Quay lại đăng nhập
          </Link>
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
