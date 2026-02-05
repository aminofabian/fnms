"use client";

import { Check } from "lucide-react";
import type { CheckoutStep } from "@/types/checkout";

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

const steps: { key: CheckoutStep; label: string }[] = [
  { key: "delivery", label: "Delivery" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
];

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav className="flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                isComplete
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                  ? "border-2 border-primary text-primary"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {isComplete ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`mx-4 h-px w-8 ${
                  isComplete ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
