"use client";

import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { MiniKit } from "@worldcoin/minikit-js";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";

const headingConfig = {
  firstLine: {
    prefix: "Discover Your",
    words: ["Truth", "Core", "Spirit", "Soul", "Heart", "Being", "Purpose"],
  },
  secondLine: {
    prefix: "Transform Your",
    words: ["View", "Lens", "Vision", "Mind", "Path", "Light", "World"],
  },
};

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentTrueWord, setCurrentTrueWord] = useState(0);
  const [currentPerspectiveWord, setCurrentPerspectiveWord] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    // Clear any old session data but preserve language preference
    if (typeof window !== "undefined") {
      // Save language preference
      const languagePreference = localStorage.getItem("language");
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      for (const c of document.cookie.split(";")) {
        document.cookie = `${c.replace(/^ +/, "").replace(/=.*/, "=;expires=")}${new Date().toUTCString()};path=/`;
      }
      
      // Restore language preference if it existed
      if (languagePreference) {
        localStorage.setItem("language", languagePreference);
      }
    }
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentTrueWord(
        (prev) => (prev + 1) % headingConfig.firstLine.words.length,
      );
      setCurrentPerspectiveWord(
        (prev) => (prev + 1) % headingConfig.secondLine.words.length,
      );
    }, 3000);

    return () => clearInterval(wordInterval);
  }, []);

  const handleWorldIDClick = async () => {
    setIsConnecting(true);
    try {
      setError(null);
      
      // Save language preference before authentication
      const languagePreference = localStorage.getItem("language");

      if (!MiniKit.isInstalled()) {
        router.push("https://worldcoin.org/download-app");
        return;
      }

      const nonceResponse = await fetch("/api/nonce", {
        credentials: "include",
      });
      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        console.error("Nonce fetch failed:", errorText);
        throw new Error(`Failed to fetch nonce: ${errorText}`);
      }

      const { nonce } = await nonceResponse.json();

      if (!nonce) {
        throw new Error("Invalid nonce received");
      }

      const { finalPayload } = await MiniKit.commandsAsync
        .walletAuth({
          nonce,
          statement: t('signIn.walletAuthStatement'),
        })
        .catch((error: unknown) => {
          console.error("Wallet auth command failed:", error);
          if (error instanceof DOMException) {
            if (error.name === "SyntaxError") {
              throw new Error("Invalid SIWE message format");
            }
            throw new Error("Authentication cancelled");
          }
          throw error;
        });

      if (!finalPayload || finalPayload.status !== "success") {
        console.error("Wallet auth failed:", finalPayload);
        throw new Error("Authentication failed");
      }

      // Get the wallet address from MiniKit after successful auth
      const walletAddress = MiniKit.user?.walletAddress;

      const response = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to complete SIWE verification",
        );
      }

      const data = await response.json();

      if (data.status === "error" || !data.isValid) {
        throw new Error(data.message || "Failed to verify SIWE message");
      }

      // Get the normalized wallet address
      const userWalletAddress = (walletAddress || data.address)?.toLowerCase();

      if (!userWalletAddress) {
        throw new Error("No wallet address available");
      }

      // Check if user exists using the API endpoint
      const userCheckResponse = await fetch("/api/user/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: userWalletAddress }),
      });

      if (!userCheckResponse.ok) {
        const errorData = await userCheckResponse.json();
        throw new Error(errorData.error || "Failed to check user existence");
      }

      const userCheckData = await userCheckResponse.json();

      if (userCheckData.exists) {
        // User exists, create session and redirect to home
        try {
          const sessionResponse = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              walletAddress: userWalletAddress,
              isSiweVerified: data.isValid,
            }),
          });

          if (!sessionResponse.ok) {
            const sessionError = await sessionResponse.json();
            throw new Error(sessionError.error || "Failed to create session");
          }

          // Add a small delay to ensure session is properly set
          await new Promise((resolve) => setTimeout(resolve, 500));
          
          // Restore language preference after session creation
          if (languagePreference) {
            localStorage.setItem("language", languagePreference);
          }

          // Check if this is the user's first login
          const userResponse = await fetch("/api/user/me", {
            method: "GET",
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });

          if (!userResponse.ok) {
            console.error(
              "Failed to fetch user data:",
              await userResponse.text(),
            );
            // If we can't fetch user data, just redirect to home
            router.push("/");
            return;
          }

          const userData = await userResponse.json();

          // If this is their first login (checking created_at vs updated_at)
          if (userData.createdAt === userData.updatedAt) {
            router.push("/welcome");
          } else {
            router.push("/");
          }
        } catch (error) {
          console.error("Session/User data error:", error);
          // If something goes wrong after session creation, redirect to home
          router.push("/");
        }
      } else {
        // User doesn't exist, redirect to registration
        router.push(
          `/register?userId=${encodeURIComponent(userWalletAddress)}`,
        );
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Authentication cancelled"
      ) {
        setError(t('signIn.errors.authCancelled'));
        return;
      }

      console.error("WorldID auth failed:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name,
        code: error instanceof DOMException ? error.code : undefined,
        name: error instanceof DOMException ? error.name : undefined,
      });

      let errorMessage = t('signIn.errors.authFailed');
      if (error instanceof Error) {
        if (error.message === "Invalid SIWE message format") {
          errorMessage = t('signIn.errors.invalidSiweFormat');
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
      }

      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center w-full"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full h-[510px] -mt-4 lg:h-[600px]"
      >
        <div className="w-full absolute top-0 bg-white rounded-b-[65px] shadow-[inset_-5px_-5px_25px_0px_rgba(134,152,183,1.00),inset_5px_5px_25px_0px_rgba(248,248,246,1.00)]" />
        <div className="w-full h-full px-[34px] pt-[125px] pb-[70px] absolute top-0 bg-[#2c5154] rounded-b-[65px] shadow-[21px_38px_64.69999694824219px_3px_rgba(0,0,0,0.25)] overflow-hidden lg:pt-[180px]">
          <div className="max-w-md mx-auto lg:max-w-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="relative w-16 h-16 lg:w-24 lg:h-24">
                <Image
                  src="/MindVaultLogoTransparentHD.svg"
                  alt="MindVault Logo"
                  width={96}
                  height={96}
                  className="w-full h-full"
                  priority
                />
              </div>
            </motion.div>

            <h1 className="text-white text-[clamp(3rem,9vw,3.5rem)] font-medium leading-[1] mb-8">
              {t('signIn.headings.firstLine.prefix')}{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTrueWord}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-bold inline-block text-[#e36c59]"
                >
                  {t(`signIn.headings.firstLine.words.${currentTrueWord}`)}
                </motion.span>
              </AnimatePresence>
            </h1>
            <h2 className="text-white text-[clamp(2.75rem,8vw,3.25rem)] font-medium leading-[1]">
              {t('signIn.headings.secondLine.prefix')}{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPerspectiveWord}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-bold inline-block text-[#e36c59]"
                >
                  {t(`signIn.headings.secondLine.words.${currentPerspectiveWord}`)}
                </motion.span>
              </AnimatePresence>
            </h2>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-md space-y-4 text-center mt-auto p-4"
      >
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <FilledButton
          variant="primary"
          size="lg"
          className="w-full bg-[#E36C59] hover:bg-[#E36C59]/90"
          onClick={handleWorldIDClick}
          disabled={isConnecting}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="relative w-5 h-5">
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Wallet className="w-5 h-5" />
              )}
            </div>
            <span>{isConnecting ? t('signIn.connecting') : t('signIn.worldIdButton')}</span>
          </div>
        </FilledButton>

        <p className="text-sm text-muted-foreground pb-6 mt-4">
          {t('signIn.privacyNotice')}{" "}
          <a
            href="https://docs.google.com/document/d/1GXZ5ZBevKkXUVdIfgB3Mz4KsBrjuuSQZmjocx_RH3XY/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {t('signIn.privacyPolicy')}
          </a>{" "}
          {t('signIn.and')}{" "}
          <a
            href="https://docs.google.com/document/d/1Rn1Whrf3gIaq0UGMxsSyWeheTcXNZfMRAYFhegFu3vQ/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {t('signIn.termsOfService')}
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
