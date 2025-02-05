"use client";

import React, { useEffect, useState, useRef } from 'react';
import { InsightResultCard } from '@/components/ui/InsightResultCard';
import { FilledButton } from '@/components/ui/FilledButton';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import ResultsCanvas from '@/components/Canvas';

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
  const [fullAnalysis, setFullAnalysis] = useState<string>('');
  const [ideology, setIdeology] = useState<string>('');
  const searchParams = useSearchParams();
  const [scores, setScores] = useState({ econ: 0, dipl: 0, govt: 0, scty: 0 });
  const [publicFigure, setPublicFigure] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const testId = searchParams.get('testId')

  const fetchInsights = async () => {
    setLoading(true);

    try {
      // Check user's pro status
      const userResponse = await fetch('/api/user/subscription');
      if (!userResponse.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      const userData = await userResponse.json();
      setIsProUser(userData.isPro);

      // Fetch ideology
      const ideologyResponse = await fetch('/api/ideology');
      if (ideologyResponse.ok) {
        const ideologyData = await ideologyResponse.json();
        setIdeology(ideologyData.ideology);
      }

      // Fetch insights
      const response = await fetch(`/api/insights/${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      const data = await response.json();
      setInsights(data.insights);

      // Get scores from database
      const scoresResponse = await fetch(`/api/tests/${testId}/progress`);
      const scoresData = await scoresResponse.json();
      const { scores } = scoresData;
      setScores(scoresData.scores);

      // Get public figure match
      const figureResponse = await fetch('/api/public-figures');
      if (figureResponse.ok) {
        const figureData = await figureResponse.json();
        setPublicFigure(figureData.celebrity || 'Unknown Match');
      }

      // Call DeepSeek API for full analysis
      if (isProUser) {
        const deepSeekResponse = await fetch('/api/deepseek', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            econ: parseFloat(scores.econ || '0'),
            dipl: parseFloat(scores.dipl || '0'),
            govt: parseFloat(scores.govt || '0'),
            scty: parseFloat(scores.scty || '0'),
          }),
        });

        if (deepSeekResponse.status === 200) {
          const deepSeekData = await deepSeekResponse.json();
          setFullAnalysis(deepSeekData.analysis);
        } else {
          console.error('Error fetching DeepSeek analysis:', deepSeekResponse.statusText);
          setFullAnalysis('Failed to generate analysis. Please try again later.');
        }
      }

    } catch (error) {
      console.error('Error fetching insights:', error);
      setFullAnalysis('Failed to generate analysis. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [searchParams]);

  const handleAdvancedInsightsClick = () => {
    setIsModalOpen(true);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleShareAnalysis = () => {
    setIsModalOpen(false);
    setIsShareModalOpen(true);
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `results.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
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
              variant={isProUser ? 'default' : 'default'}
              className={cn(
                "mt-4",
                "transform transition-all duration-300 hover:scale-105"
              )}
            >
              {isProUser ? 'Advanced Insights' : 'Unlock Advanced Insights'}
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
          insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
            >
              <InsightResultCard
                title={`${insight.category.charAt(0).toUpperCase() + insight.category.slice(1)} Perspective`}
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

        {/* Added Share Button */}
        <div className="flex justify-center pt-8">
          <FilledButton
            onClick={handleShareClick}
            variant="default"
            className="px-12 py-6 text-lg transform transition-all duration-300 hover:scale-105"
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
            onClick={() => setIsShareModalOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors hover:bg-white/10 p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Share Your Results
          </h2>
        </div>

        <div className="p-6 text-center max-h-[70vh] overflow-y-auto scrollbar-custom">
          <div className="w-full max-w-md mx-auto">
            <ResultsCanvas
              ref={canvasRef}
              econ={scores.econ}
              dipl={scores.dipl}
              govt={scores.govt}
              scty={scores.scty}
              closestMatch={publicFigure}
            />
          </div>
        </div>

        <div className="flex justify-between gap-3 p-4 border-t border-white/10 bg-[#162026]/80">
          <FilledButton
            variant="default"
            onClick={downloadImage}
            className="flex-1 py-3 text-sm bg-[#387478] 
                     flex items-center justify-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="whitespace-nowrap">Download Image</span>
          </FilledButton>
          <FilledButton
            variant="default"
            onClick={() => console.log('Share functionality')}
            className="flex-1 py-3 text-sm bg-[#E36C59]
                     flex items-center justify-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="whitespace-nowrap">Share Link</span>
          </FilledButton>
        </div>
      </motion.div>
    </motion.div>
  )}

      {/* Existing Advanced Insights Modal */}
      {isModalOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div 
            className="relative w-full max-w-4xl bg-gradient-to-b from-brand-tertiary/20 to-brand-tertiary/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary/20 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative p-6 pb-4 text-center border-b border-white/10 bg-white/5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors hover:bg-white/10 p-2 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
                {isProUser ? 'Advanced Ideological Analysis' : 'Unlock Advanced Insights'}
              </h2>
            </div>

            <div className="p-6 text-center max-h-[70vh] overflow-y-auto scrollbar-custom">
              {isProUser ? (
                <div className="w-full max-w-3xl mx-auto">
                  <p className="text-white/90 leading-relaxed text-base whitespace-pre-wrap">
                    {fullAnalysis}
                  </p>
                </div>
              ) : (
              <div className="w-full max-w-md mx-auto">
                <p className="text-white/90 mb-6">
                  Dive deeper into your ideological profile with Awaken Pro. Get comprehensive analysis and personalized insights.
                </p>
                <div className="flex justify-center">
                  <FilledButton
                    variant="default"
                    onClick={() => router.push('/awaken-pro')}
                    className="transform transition-all duration-300 hover:scale-105"
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
                  variant="default"
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
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="whitespace-nowrap">Share Analysis</span>
                </FilledButton>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}