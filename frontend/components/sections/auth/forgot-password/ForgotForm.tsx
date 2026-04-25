'use client'

import { useState } from "react";
import ForgotFormField from "./ForgotFormField";
import Image from "next/image";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="bg-white w-full flex items-center">
      <div className="px-20 py-30 w-[70%]  ">
        <ForgotFormField email={email} setEmail={setEmail} loading={loading} setLoading={setLoading} />
      </div>

      <div className="relative w-1/2 min-h-screen">
        <Image
          src="/images/img-register.png"
          alt="registerbanner"
          fill
          sizes="50vw"
          quality={100}
          className="object-cover "
        />
      </div>
    </div>
  );
}
