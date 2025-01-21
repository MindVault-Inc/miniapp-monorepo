"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FilledButton } from "@/components/ui/FilledButton";

export default function Welcome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") || "User";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-screen min-h-screen bg-[#2c5154]">
        <div className="w-full max-w-md mx-auto px-[34px] pt-[162px]">
          <h1 className="text-white text-[45px] font-medium font-spaceGrotesk leading-[50px] mb-8">
            Welcome {name}!
          </h1>
          <p className="text-white text-[45px] font-medium font-spaceGrotesk leading-[50px]">
            Your journey toward understanding your true self begins here.
            <br /><br />
            Let&apos;s unlock your potential together!
          </p>
        </div>

        <div className="fixed bottom-12 right-8">
          <FilledButton
            variant="default"
            size="sm"
            className="w-[132px] h-9 bg-[#e36c59] text-[#eeeeee] text-base font-bold"
            onClick={() => router.push("/")}
          >
            Get Started
          </FilledButton>
        </div>
      </div>
    </div>
  );
} 