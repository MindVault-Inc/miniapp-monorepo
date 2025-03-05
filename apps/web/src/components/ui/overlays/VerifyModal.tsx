"use client";

import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { Dialog, DialogContent } from "./dialog";
import { useVerification } from "@/hooks/useVerification";
import Image from "next/image";
import type * as React from "react";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => Promise<void>;
}

export function VerifyModal({ isOpen, onClose, onVerify }: VerifyModalProps) {
  const { isVerifying, error } = useVerification();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[368px] rounded-[30px] bg-[#2c5154] p-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] [&>button]:hidden"
        onInteractOutside={() => onClose()}
        onEscapeKeyDown={() => onClose()}
      >
        <div className="relative flex flex-col items-center px-8 py-6">
          <Image
            src="/mindvault-logo.png"
            alt="Verify Icon"
            width={114}
            height={110}
            className="mb-4 object-contain"
            priority
            loading="eager"
            sizes="114px"
          />

          <h2 className="mb-4 text-center text-[32px] font-semibold text-white">
            Not Verified yet?
          </h2>

          <p className="mb-8 text-center font-spaceGrotesk text-[15px] font-bold leading-[25px] text-white">
            Use your World ID app to verify your identity!
            <br />
            <br />
            Simply tap &ldquo;Verify!&rdquo; below and follow the prompts to complete verification.
            <br />
            <br />
            By verifying you will have access to more features on the app.
          </p>

          {error && (
            <p className="mb-4 text-center text-sm text-red-400">{error}</p>
          )}

          <div className="mt-auto flex w-full justify-between">
            <FilledButton
              variant="primary"
              size="sm"
              className="rounded-[30px] bg-[#e36c59] px-6 hover:bg-[#e36c59]/90"
              onClick={onClose}
            >
              Maybe Later
            </FilledButton>

            <FilledButton
              variant="primary"
              size="sm"
              className="rounded-[20px] bg-[#e36c59] px-6 hover:bg-[#e36c59]/90"
              onClick={onVerify}
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify!"}
            </FilledButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
