"use client";

import React, { useEffect, useState } from 'react';
import { InsightResultCard } from '@/components/ui/InsightResultCard';

// Example data (fallback for now)
const exampleInsights = [
  {
    axis: 'economic',
    percentage: 55,
    insight: 'You favor a balanced approach between economic equality and market freedom.',
    values: { left: 55, right: 45, label: 'Equality / Markets' },
  },
  {
    axis: 'diplomatic',
    percentage: 30,
    insight: 'You lean toward national interests but see value in limited international collaboration.',
    values: { left: 30, right: 70, label: 'Nation / Globe' },
  },
  {
    axis: 'civil',
    percentage: 75,
    insight: 'You value personal freedoms and believe civil liberties should be protected above all.',
    values: { left: 75, right: 25, label: 'Liberty / Authority' },
  },
  {
    axis: 'societal',
    percentage: 20,
    insight: 'You lean toward traditionalism but are open to gradual social changes.',
    values: { left: 20, right: 80, label: 'Tradition / Progress' },
  },
];

export default function InsightsPage() {
  const [insights, setInsights] = useState(exampleInsights); // Default to example data
  const [loading, setLoading] = useState(true);

  // Placeholder function to simulate backend fetch
  const fetchInsights = async () => {
    try {
      // Uncomment this block when the API is ready:
      // const response = await fetch('/api/insights');
      // const data = await response.json();
      // setInsights(data.results);

      // Simulating API fetch with a delay (remove this once API is connected)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
      console.log('Using example insights for now...');
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(); // Fetch insights (currently uses example data)
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <p className="text-slate-200">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header Section */}
      <div className="bg-brand-tertiary p-10 pt-16 pb-12 rounded-b-[4rem] shadow-lg border-b border-brand-tertiary/20 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-tertiary/50 to-transparent"></div>
        <div className="relative z-10 text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">
            Your Ideology Insights
          </h1>
          <p className="text-slate-200/90 text-lg mb-4 max-w-sm mx-auto font-medium leading-relaxed">
            Explore how your values align across key ideological dimensions.
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="max-w-3xl mx-auto px-6 space-y-8 pb-16">
        {insights.map((insight, index) => (
          <InsightResultCard
            key={index}
            title={`${insight.axis.charAt(0).toUpperCase() + insight.axis.slice(1)} Perspective`}
            description={insight.insight}
            scale={insight.percentage}
            values={insight.values}
          />
        ))}
      </div>
    </div>
  );
}
