import React from 'react';

interface InsightsDetailProps {
  title: string;
  description: string;
  className?: string;
}

export function InsightsDetail({ 
  title, 
  description,
  className = ""
}: InsightsDetailProps) {
  return (
    <div className={`bg-teal-700 text-white p-8 rounded-3xl max-w-md mx-auto text-center shadow-lg transform transition-transform hover:scale-105 ${className}`}>
      <h2 className="text-3xl font-bold mb-6">
        {title}
      </h2>
      <p className="text-lg leading-relaxed italic">
        &ldquo;{description}&rdquo;
      </p>
    </div>
  );
}

// Example usage
export default function InsightsDetailExample() {
  return (
    <div className="p-4">
      <InsightsDetail
        title="Your Economic Perspective"
        description="You lean towards Equality, valuing fairness and redistribution of wealth."
      />
    </div>
  );
}

