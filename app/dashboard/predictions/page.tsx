'use client';

import React from 'react';
import { RiskPredictorStudio } from '@/components/ml/RiskPredictorStudio';
import { Sparkles, Cpu, Activity } from 'lucide-react';

export default function PredictionsPage() {
  return (
    <div className="p-4 sm:p-6 h-full flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#14F1D9]/20 to-[#7C5CFF]/20 border border-[rgba(20,241,217,0.4)] flex items-center justify-center shadow-[0_0_15px_rgba(20,241,217,0.3)]">
            <Cpu className="w-5 h-5 text-[#14F1D9]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#F0F4FF] flex items-center gap-2">
              ML Campus Risk Prediction & Forecasting
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#14F1D9]/15 text-[#14F1D9] border border-[#14F1D9]/40 uppercase">
                5,000 Trained Rows
              </span>
            </h1>
            <p className="text-xs text-[#8B9AB4]">
              Multi-factor statistical inference predicting incident probability, SHAP impact factors & preventive SOPs
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <RiskPredictorStudio />
      </div>
    </div>
  );
}
