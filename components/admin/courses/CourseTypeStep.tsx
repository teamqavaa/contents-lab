"use client";

import { Monitor, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DjangoTypeCourse } from "@/lib/api/courses-api";

const cardClass =
  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors cursor-pointer hover:border-primary hover:bg-primary/5";
const cardActive =
  "border-primary bg-primary/5 ring-1 ring-primary";

export function CourseTypeStep({
  types,
  selectedId,
  onSelect,
  onNext,
}: {
  types: DjangoTypeCourse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Select course type</h2>
        <p className="text-xs text-muted-foreground">
          Choose the delivery format for this course.
        </p>
      </div>
      {types.length === 0 ? (
        <p className="text-sm text-muted-foreground">No course types found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${cardClass} ${selectedId === t.id ? cardActive : ""}`}
              onClick={() => onSelect(t.id)}
            >
              <div className="flex items-center gap-2">
                {t.is_virtual ? (
                  <Monitor size={16} className="text-primary" />
                ) : (
                  <Users size={16} className="text-primary" />
                )}
                <span className="text-sm font-medium">{t.name}</span>
              </div>
              {t.description && (
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {t.description}
                </span>
              )}
              <span className="mt-auto inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {t.is_virtual ? "Online" : "In-person"}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-end pt-2">
        <Button size="sm" disabled={!selectedId} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
