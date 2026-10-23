"use client"

import { useState } from "react"
import { Check, Copy, Lightbulb } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/lab/ui/accordion"
import { Badge } from "@/components/lab/ui/badge"
import { Button } from "@/components/lab/ui/button"
import { ScrollArea } from "@/components/lab/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { LabStep } from "@/lib/lab/types"
import type { StepStatus } from "./lab-types"

const STATUS_LABEL: Record<StepStatus, string> = {
  done: "Done",
  in_progress: "In Progress",
  locked: "Locked",
}

const STATUS_BADGE_CLASS: Record<StepStatus, string> = {
  done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  in_progress:
    "border-amber-500/30 bg-amber-500/10 text-amber-600",
  locked: "border-border bg-muted text-muted-foreground",
}

export type LabStepsProps = {
  steps: LabStep[]
  stepStatus: Record<string, StepStatus>
  activeStepId: string
  openStepIds: string[]
  hintsRevealed: Record<string, boolean>
  onStepChange: (stepId: string) => void
  onOpenChange: (value: string[]) => void
  onToggleHint: (stepId: string) => void
  onToggleDone?: (stepId: string) => void
  className?: string
}

export function LabSteps({
  steps,
  stepStatus,
  activeStepId,
  openStepIds,
  hintsRevealed,
  onStepChange,
  onOpenChange,
  onToggleHint,
  onToggleDone,
  className,
}: LabStepsProps) {
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null)

  const copyContent = async (step: LabStep) => {
    try {
      await navigator.clipboard.writeText(step.content)
      setCopiedStepId(step.id)
      setTimeout(
        () => setCopiedStepId((id) => (id === step.id ? null : id)),
        2000
      )
    } catch {
      // Clipboard blocked; leave the button inert.
    }
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border bg-card/50",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Steps</span>
        <span className="text-xs text-muted-foreground">{steps.length}</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <Accordion
          value={openStepIds}
          onValueChange={onOpenChange}
          className="p-1.5"
        >
          {steps.map((step) => {
            const status = stepStatus[step.id]
            const locked = status === "locked"
            return (
              <AccordionItem
                key={step.id}
                value={step.id}
                disabled={locked}
                className={locked ? "opacity-60" : undefined}
              >
                <AccordionTrigger
                  onClick={() => !locked && onStepChange(step.id)}
                  className={cn(
                    "gap-2 px-3",
                    activeStepId === step.id && "bg-primary/10"
                  )}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs tabular-nums text-muted-foreground">
                      {step.order}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{step.title}</span>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", STATUS_BADGE_CLASS[status])}
                    >
                      {STATUS_LABEL[status]}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3">
                  <div className="relative">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="absolute right-0 top-0"
                      aria-label={
                        copiedStepId === step.id ? "Copied" : "Copy"
                      }
                      onClick={() => copyContent(step)}
                    >
                      {copiedStepId === step.id ? <Check /> : <Copy />}
                    </Button>
                    <p className="whitespace-pre-line pr-8 text-muted-foreground">
                      {step.content}
                    </p>
                  </div>
                  {onToggleDone && (
                    <Button
                      size="xs"
                      variant={status === "done" ? "outline" : "default"}
                      className="mt-2"
                      onClick={() => onToggleDone(step.id)}
                    >
                      {status === "done" ? "Undo" : "Mark as done"}
                    </Button>
                  )}
                  {step.hint && (
                    <div className="mt-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onToggleHint(step.id)}
                      >
                        <Lightbulb />
                        {hintsRevealed[step.id] ? "Hide hint" : "Show hint"}
                      </Button>
                      {hintsRevealed[step.id] && (
                        <div className="mt-2 rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                          {step.hint}
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </ScrollArea>
    </div>
  )
}