"use client";

import Link from "next/link";
import type { Lab } from "@/types/student/lab";
import { Badge } from "@/components/student/ui/badge";
import { Button } from "@/components/student/ui/button";
import { Progress } from "@/components/student/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/student/ui/tooltip";

// Monochrome intensity instead of color: outline = untouched, secondary = in
// flight, filled = done. Keeps the card inside the neutral dashboard palette.
const statusVariants: Record<string, "outline" | "secondary" | "default"> = {
  not_started: "outline",
  in_progress: "secondary",
  completed: "default",
};

const statusLabels: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const buttonLabels: Record<string, string> = {
  not_started: "Start",
  in_progress: "Continue",
  completed: "Review",
};

export default function LabCard({
  lab,
  labStatus = "not_started",
  progressPercent = 0,
  completedSteps = 0,
  totalSteps = 0,
}: {
  lab: Lab;
  labStatus?: "not_started" | "in_progress" | "completed";
  progressPercent?: number;
  completedSteps?: number;
  totalSteps?: number;
}) {
  const showProgress = labStatus === "in_progress" && totalSteps > 0;

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-card rounded-xl border border-border p-5 flex items-center justify-between gap-4 group">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-muted-foreground">
                  {lab.language}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {lab.difficulty}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground leading-snug mb-3 truncate">
                {lab.title}
              </p>

              {showProgress && (
                <div className="mb-3">
                  <Progress value={progressPercent} className="mb-1" />
                  <p className="text-[10px] text-muted-foreground">
                    {completedSteps}/{totalSteps} steps
                  </p>
                </div>
              )}

              <Badge variant={statusVariants[labStatus]}>{statusLabels[labStatus]}</Badge>
            </div>

            <Button asChild size="sm" className="flex-shrink-0">
              <Link href={`/labs/${lab.id}`}>{buttonLabels[labStatus]}</Link>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>{lab.description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
