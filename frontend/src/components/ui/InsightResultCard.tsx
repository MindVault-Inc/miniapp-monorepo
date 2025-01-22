import React from 'react';
import InsightResultTag from '@/components/ui/InsightResultTag';

interface InsightResultCardProps {
  title: string;
  description: string;
  scale: number;
  values: {
    left: number;
    right: number;
    label: string;
  };
}

export function InsightResultCard({ title, description, scale, values }: InsightResultCardProps) {
  return (
    <div className="bg-brand-secondary rounded-3xl p-8 shadow-lg border border-brand-tertiary/10 
                  hover:shadow-xl transition-all duration-300 ease-in-out">
      <h2 className="text-2xl font-bold text-slate-100 mb-4 tracking-tight">{title}</h2>
      <p className="text-slate-200/90 mb-8 italic leading-relaxed">"{description}"</p>
      
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-slate-200/90 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-red rounded-full"></span>
            {values.label.split(' / ')[0]}
          </span>
          <span className="flex items-center gap-2">
            {values.label.split(' / ')[1]}
            <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
          </span>
        </div>
        <div className="h-3 bg-neutral-bg/90 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-accent-red to-accent-redSoft transition-all duration-500 rounded-full"
            style={{ width: `${values.left}%` }}
          />
        </div>
        <div className="flex justify-center mt-6">
          <InsightResultTag scale={scale} />
        </div>
      </div>
    </div>
  );
}

// Example usage
export default function InsightResultCardExample() {
  return (
    <div className="p-4">
      <InsightResultCard
        title="Your Economic Perspective"
        description="You lean towards Equality, valuing fairness and redistribution of wealth."
        scale={50}
        values={{
          left: 75,
          right: 25,
          label: "Equality / Inequality"
        }}
      />
    </div>
  );
}

