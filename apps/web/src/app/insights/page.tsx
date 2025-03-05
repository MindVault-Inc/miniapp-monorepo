"use client";

import { Canvas as ResultsCanvas } from "@/components/features";
import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { InsightResultCard } from "@/components/ui/cards/InsightResultCard";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

interface Insight {
  category: string;
  percentage: number;
  insight: string;
  description: string;
  left_label: string;
  right_label: string;
  values: {
    left: number;
    right: number;
    label: string;
  };
}

export default function InsightsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [fullAnalysis, setFullAnalysis] = useState<string>("");
  const [ideology, setIdeology] = useState<string>("");
  const searchParams = useSearchParams();
  const [scores, setScores] = useState({ econ: 0, dipl: 0, govt: 0, scty: 0 });
  const [publicFigure, setPublicFigure] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Emit modal state changes
  useEffect(() => {
    const event = new CustomEvent("shareModalState", {
      detail: { isOpen: isShareModalOpen },
    });
    window.dispatchEvent(event);
  }, [isShareModalOpen]);

  // Emit advanced insights modal state changes
  useEffect(() => {
    const event = new CustomEvent("shareModalState", {
      detail: { isOpen: isModalOpen },
    });
    window.dispatchEvent(event);
  }, [isModalOpen]);

  // Combined effect to ensure bottom nav stays hidden when either modal is open
  useEffect(() => {
    const isAnyModalOpen = isShareModalOpen || isModalOpen;
    const event = new CustomEvent("shareModalState", {
      detail: { isOpen: isAnyModalOpen },
    });
    window.dispatchEvent(event);
  }, [isShareModalOpen, isModalOpen]);

  const testId = searchParams.get("testId");

  useEffect(() => {
    async function fetchInsights() {
      try {
        // Check user's pro status
        const userResponse = await fetch("/api/user/subscription");
        if (!userResponse.ok) {
          throw new Error("Failed to fetch subscription status");
        }
        const userData = await userResponse.json();
        setIsProUser(userData.isPro);

        // Fetch ideology
        const ideologyResponse = await fetch("/api/ideology");
        if (ideologyResponse.ok) {
          const ideologyData = await ideologyResponse.json();
          setIdeology(ideologyData.ideology);
        }

        // Fetch insights
        const response = await fetch(`/api/insights/${testId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }
        const data = await response.json();
        setInsights(data.insights);

        // Get scores from database
        const scoresResponse = await fetch(`/api/tests/${testId}/progress`);
        if (!scoresResponse.ok) {
          throw new Error("Failed to fetch scores");
        }
        const scoresData = await scoresResponse.json();
        setScores(scoresData.scores);

        // Get public figure match
        const figureResponse = await fetch("/api/public-figures");
        if (!figureResponse.ok) {
          throw new Error("Failed to fetch public figure match");
        }
        const figureData = await figureResponse.json();
        setPublicFigure(figureData.celebrity || "Unknown Match");

      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchInsights();
  }, [testId]);

  // Separate effect for Gemini API call
  useEffect(() => {
    async function fetchGeminiAnalysis() {
      if (!isProUser || !isModalOpen) return;
      
      setIsGeminiLoading(true);
      try {
        const geminiResponse = await fetch("/api/gemini-flash", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            econ: scores.econ || 0,
            dipl: scores.dipl || 0,
            govt: scores.govt || 0,
            scty: scores.scty || 0,
          }),
        });

        if (geminiResponse.status === 200) {
          const geminiData = await geminiResponse.json();
          setFullAnalysis(geminiData.analysis);
        } else {
          console.error(
            "Error fetching Gemini analysis:",
            geminiResponse.statusText,
          );
          setFullAnalysis(
            "Failed to generate analysis. Please try again later.",
          );
        }
      } catch (error) {
        console.error("Error fetching Gemini analysis:", error);
        setFullAnalysis("Failed to generate analysis. Please try again later.");
      } finally {
        setIsGeminiLoading(false);
      }
    }

    void fetchGeminiAnalysis();
  }, [isProUser, isModalOpen, scores]);

  const handleAdvancedInsightsClick = () => {
    setIsModalOpen(true);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleShareAnalysis = () => {
    setIsShareModalOpen(true);
    
    setTimeout(() => {
      setIsModalOpen(false);
    }, 50);
  };

  const handleInstagramShare = async () => {
    if (!canvasRef.current) return;

    try {
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob((b) => {
          if (b) {
            resolve(b);
          } else {
            reject(new Error("Canvas conversion failed"));
          }
        }, "image/png");
      });
      const file = new File([await blob], "results.png", { type: "image/png" });

      // Use native share if available
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "My Political Compass Results",
            text: "Check out my political compass results!",
          });
          return;
        } catch (error) {
          console.error("Error with native sharing:", error);
        }
      }

      // Fallback: share via Instagram Stories URL scheme
      const dataUrl = canvasRef.current?.toDataURL("image/png");
      const encodedImage = encodeURIComponent(dataUrl);
      const instagramUrl = `instagram-stories://share?backgroundImage=${encodedImage}&backgroundTopColor=%23000000&backgroundBottomColor=%23000000`;
      window.location.href = instagramUrl;

      // Alert if Instagram doesn't open automatically
      setTimeout(() => {
        alert(
          "If Instagram did not open automatically, please open Instagram and use the image from your camera roll to share to your story.",
        );
      }, 2500);

      // Final fallback: download the image
      const link = document.createElement("a");
      link.download = "results.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      alert(
        "Unable to share directly to Instagram. The image has been downloaded to your device - you can manually share it to your Instagram story.",
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <div className="bg-brand-tertiary p-10 pt-16 pb-12 rounded-b-[4rem] shadow-lg border-b border-brand-tertiary/20 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
        <motion.div
          className="relative z-10 text-center max-w-md mx-auto space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center space-y-3">
            <BookOpen className="h-10 w-10 mx-auto text-[#E36C59]" />
            <h1 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">
              Your Ideology Insights
            </h1>
          </div>
          {ideology && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 flex items-center justify-center min-h-[100px] mt-4"
            >
              <h2 className="text-3xl font-semibold text-slate-100 m-0">
                {ideology}
              </h2>
            </motion.div>
          )}
          <p className="text-slate-200/90 text-lg mb-4 max-w-sm mx-auto font-medium leading-relaxed">
            Explore how your values align across key ideological dimensions.
          </p>

          <motion.div
            className="flex justify-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <FilledButton
              onClick={handleAdvancedInsightsClick}
              variant={isProUser ? "primary" : "primary"}
              className={cn(
                "mt-4",
                "transform transition-all duration-300 hover:scale-105",
                "bg-gradient-to-r from-accent-red to-[#FF8066]"
              )}
            >
              {isProUser ? "Advanced Insights" : "Unlock Advanced Insights"}
            </FilledButton>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="max-w-3xl mx-auto px-6 space-y-8 pb-16"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {Array.isArray(insights) && insights.length > 0 ? (
          insights.map((insight) => (
            <motion.div
              key={`${insight.category}-${insight.percentage}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <InsightResultCard
                title={`${
                  insight.category.charAt(0).toUpperCase() +
                  insight.category.slice(1)
                } Perspective`}
                insight={insight.insight}
                description={insight.description}
                percentage={insight.percentage}
                left_label={insight.left_label}
                right_label={insight.right_label}
                values={insight.values}
              />
            </motion.div>
          ))
        ) : (
          <motion.p
            className="text-slate-200 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No insights available. Please try again later.
          </motion.p>
        )}

        {/* Share Button */}
        <div className="flex justify-center pt-8">
          <FilledButton
            onClick={handleShareClick}
            variant="primary"
            className="px-12 py-6 text-lg transform transition-all duration-300 hover:scale-105 bg-gradient-to-r from-accent-red to-[#FF8066]"
          >
            Share Results
          </FilledButton>
        </div>
      </motion.div>

      {isShareModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsShareModalOpen(false)}
        >
          <motion.div
            className="relative w-full max-w-2xl bg-gradient-to-b from-brand-tertiary/20 to-brand-tertiary/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-6 pb-4 text-center border-b border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors hover:bg-white/10 p-2 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label="Close"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
                Share Your Results
              </h2>
            </div>

            <div className="p-6 text-center max-h-[70vh] overflow-y-auto scrollbar-custom">
              <div className="w-full max-w-md mx-auto">
                {isCanvasLoading && (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <LoadingSpinner />
                  </div>
                )}
                <ResultsCanvas
                  ref={canvasRef}
                  econ={scores.econ}
                  dipl={scores.dipl}
                  govt={scores.govt}
                  scty={scores.scty}
                  closestMatch={publicFigure}
                  ideology={ideology}
                  onLoad={() => setIsCanvasLoading(false)}
                />
              </div>
            </div>

            <div className="flex justify-center p-6 border-t border-white/10 bg-[#162026]/80">
              <FilledButton
                variant="primary"
                onClick={handleInstagramShare}
                aria-label="Share results"
                className="w-full max-w-sm py-4 text-base font-medium bg-[#E36C59] hover:bg-[#E36C59]/90
                     flex items-center justify-center gap-3
                     focus:ring-2 focus:ring-offset-2 focus:ring-[#E36C59]
                     transition-all duration-300 hover:scale-[1.02]
                     sm:text-lg sm:py-5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 sm:h-7 sm:w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="whitespace-nowrap">Share Results</span>
              </FilledButton>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 bg-brand-tertiary border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary via-transparent to-transparent pointer-events-none" />

            <div className="relative p-6 pb-4 text-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors hover:bg-white/10 p-2 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label="Close modal"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-slate-100">
                {isProUser
                  ? "Advanced Ideological Analysis"
                  : "Unlock Advanced Insights"}
              </h2>
            </div>

            <div className="p-6 text-center max-h-[70vh] overflow-y-auto scrollbar-custom">
              {isProUser ? (
                <div className="w-full max-w-3xl mx-auto">
                  {isGeminiLoading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <p className="text-white/90 leading-relaxed text-base whitespace-pre-wrap">
                      {fullAnalysis}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto space-y-4">
                  <p className="text-white text-lg">
                    Dive deeper into your ideological profile with Awaken Pro.
                    Get comprehensive analysis and personalized insights.
                  </p>
                  <div className="flex justify-center pt-2">
                    <FilledButton
                      variant="primary"
                      onClick={() => router.push("/awaken-pro")}
                      className="bg-[#E36C59] hover:bg-[#E36C59]/90 transform transition-all duration-300 hover:scale-105"
                    >
                      Upgrade to Pro
                    </FilledButton>
                  </div>
                </div>
              )}
            </div>

            {isProUser && (
              <div className="flex justify-between gap-3 p-4 border-t border-white/10 bg-[#162026]/80">
                <FilledButton
                  variant="primary"
                  onClick={handleShareAnalysis}
                  className="flex-1 py-3 text-sm bg-[#E36C59]
                          flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-label="Share analysis"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span className="whitespace-nowrap">Share Analysis</span>
                </FilledButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Emit modal state for bottom nav visibility */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dispatchEvent(new CustomEvent('modalState', { 
              detail: { isOpen: ${isModalOpen} }
            }));
          `,
        }}
      />
    </div>
  );
}
