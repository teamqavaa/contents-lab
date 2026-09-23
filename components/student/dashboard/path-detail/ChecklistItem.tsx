import { Check } from "lucide-react";

export function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="text-sm leading-relaxed text-foreground">{children}</span>
    </li>
  );
}
