"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-border">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-50"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="flex h-10 min-w-[2.5rem] items-center justify-center text-sm font-medium">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
