"use client";

import { Check } from "lucide-react";

const steps = [
  { label: "Course Type", number: 1 },
  { label: "Course Info", number: 2 },
  { label: "Content", number: 3 },
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const done = current > s.number;
        const active = current === s.number;
        return (
          <div key={s.number} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={`h-px w-8 ${done ? "bg-primary" : "bg-border"}`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {done ? <Check size={14} /> : s.number}
              </div>
              <span
                className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
