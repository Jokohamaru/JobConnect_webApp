import LoginBenefits from "@/components/sections/auth/login/LoginBenefits";
import LoginForm from "@/components/sections/auth/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative">
      <div className="container mx-10 px-10  relative z-10">
        <div className="grid grid-cols-[minmax(50%,400px)_1fr] gap-10 mx-auto">
          <LoginForm />
          <LoginBenefits />
        </div>
      </div>

      <div className="bg-linear-to-r from-[#3C398E] via-[#6686B9] to-[#9DD0EA] w-full h-25 fixed bottom-0 left-0 right-0 z-0"></div>
    </div>
  );
}
