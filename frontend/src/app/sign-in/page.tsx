"use client";

import { signIn } from "next-auth/react";
import { FilledButton } from "@/components/ui/FilledButton";
import { Wallet } from "lucide-react";
import { OutlinedButton } from "@/components/ui/OutlinedButton";
import { Chrome } from "lucide-react";

export default function SignIn() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-screen h-[510px] -mt-4">
        <div className="w-screen absolute top-0 bg-white rounded-b-[65px] shadow-[inset_-5px_-5px_25px_0px_rgba(134,152,183,1.00),inset_5px_5px_25px_0px_rgba(248,248,246,1.00)]" />
        <div className="w-screen h-full px-[34px] pt-[125px] pb-[70px] absolute top-0 bg-[#2c5154] rounded-b-[65px] shadow-[21px_38px_64.69999694824219px_3px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="max-w-md mx-auto">
            <h1 className="text-white text-[50px] font-medium leading-[50px] mb-6">
              Discover Your <span className="font-bold">True Self</span>
            </h1>
            <h2 className="text-white text-[50px] font-medium leading-[50px]">
              Transform Your <span className="font-bold">Perspective</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 text-center mt-auto p-4">
        <FilledButton
          variant="default"
          size="sm"
          icon={Wallet}
          className="w-full max-w-[200px] h-10 text-base transform transition-all duration-300 hover:scale-105 mx-auto"
          onClick={() => signIn("worldcoin", { callbackUrl: "/" })}
        >
          World ID
        </FilledButton>

        <OutlinedButton
          variant="default"
          size="sm"
          icon={Chrome}
          className="w-full max-w-[200px] h-10 text-base transform transition-all duration-300 hover:scale-105 mx-auto"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Google sign in
        </OutlinedButton>

        <p className="text-sm text-muted-foreground pb-6 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
} 