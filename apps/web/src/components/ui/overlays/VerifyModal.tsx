"use client";

import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { Dialog, DialogContent } from "./dialog";
import { useVerification } from "@/hooks/useVerification";
import { useTranslation } from "@/i18n";
import Image from "next/image";
import type * as React from "react";

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => Promise<void>;
}

export function VerifyModal({ isOpen, onClose, onVerify }: VerifyModalProps) {
  const { isVerifying, error } = useVerification();
  const { t } = useTranslation();

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
            {t('home.verifyModal.title')}
          </h2>

          <p className="mb-8 text-center font-spaceGrotesk text-[15px] font-bold leading-[25px] text-white">
            {t('home.verifyModal.description')}
            <br />
            <br />
            {t('home.verifyModal.instruction')}
            <br />
            <br />
            {t('home.verifyModal.benefits')}
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
              {t('home.verifyModal.maybeLater')}
            </FilledButton>

            <FilledButton
              variant="primary"
              size="sm"
              className="rounded-[20px] bg-[#e36c59] px-6 hover:bg-[#e36c59]/90"
              onClick={onVerify}
              disabled={isVerifying}
            >
              {isVerifying ? t('common.loading') : t('home.verifyModal.verify')}
            </FilledButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
