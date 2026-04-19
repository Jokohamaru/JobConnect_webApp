import Link from "next/link";
import DivideLogin from "./DivideLogin";
import LoginFormField from "./LoginFormFields";
import LoginHeader from "./LoginHeader";
import SocialLoginButton from "./SocialLoginButton";

export default function LoginForm(){
    return(
        <div className="">
            <LoginHeader />
            <SocialLoginButton />
            <DivideLogin />

            <LoginFormField />

            <div className="text-center ">
                <p>Bạn chưa có tài khoản? <Link className="text-[#E94133] hover:underline" href="/auth/register">Đăng ký ngay!</Link></p>
            </div>
        </div>
    )
}