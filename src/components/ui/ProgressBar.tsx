"use client";

import { WIZARD_STEPS } from "@/lib/types";

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentStepInfo = WIZARD_STEPS[currentStep - 1];
  const progressPercent = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <nav aria-label="Postęp formularza" className="w-full mb-8 bg-white border border-gov-border p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <h2 className="text-lg font-bold text-gov-blue">
            {currentStepInfo.name}
          </h2>
          <span className="text-sm text-gov-text font-bold">
            Krok {currentStep} z {WIZARD_STEPS.length}
          </span>
        </div>
        
        <div className="w-full bg-gov-gray-light h-4 border border-gov-border relative">
          <div
            className="bg-gov-blue h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={WIZARD_STEPS.length}
          />
        </div>
        
        <p className="text-sm text-gov-text-light">
          {currentStepInfo.description}
        </p>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Jesteś na kroku {currentStep} z {WIZARD_STEPS.length}: {currentStepInfo.name}
      </div>
    </nav>
  );
}
