"use client";

import { useState } from "react";
import { ArrowLeft, Check, ChevronDown, LayoutList, Target, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DjangoCourse,
  DjangoCourseHighlight,
  DjangoCourseLearningPoint,
  DjangoCourseOutcome,
  DjangoLesson,
  DjangoModule,
  DjangoVideo,
} from "@/lib/api/courses-api";
import type { Lab } from "@/lib/api/lab-api";
import { OutcomesPanel } from "./OutcomesPanel";
import { HighlightsPanel } from "./HighlightsPanel";
import { LearningPointsPanel } from "./LearningPointsPanel";
import { CurriculumPanel } from "./CurriculumPanel";

type SectionKey = "outcomes" | "highlights" | "learning_points" | "curriculum";

const SECTIONS: {
  key: SectionKey;
  label: string;
  desc: string;
  icon: typeof Target;
}[] = [
  {
    key: "outcomes",
    label: "Learning Outcomes",
    desc: "What students will be able to do after the course",
    icon: Target,
  },
  {
    key: "highlights",
    label: "Highlights",
    desc: "Key selling points of the course",
    icon: Sparkles,
  },
  {
    key: "learning_points",
    label: "Learning Points",
    desc: "Key concepts covered in the course",
    icon: Lightbulb,
  },
  {
    key: "curriculum",
    label: "Curriculum",
    desc: "Modules, lessons and videos",
    icon: LayoutList,
  },
];

export function RelatedEntitiesStep({
  course,
  outcomes,
  highlights,
  learningPoints,
  modules,
  lessons,
  videos,
  drLabs,
  onBack,
  onFinish,
  onRefreshRelated,
}: {
  course: DjangoCourse;
  outcomes: DjangoCourseOutcome[];
  highlights: DjangoCourseHighlight[];
  learningPoints: DjangoCourseLearningPoint[];
  modules: DjangoModule[];
  lessons: DjangoLesson[];
  videos: DjangoVideo[];
  drLabs: Lab[];
  onBack: () => void;
  onFinish: () => void;
  onRefreshRelated: () => Promise<void>;
}) {
  const [open, setOpen] = useState<SectionKey[]>(["outcomes", "highlights", "learning_points", "curriculum"]);

  function toggle(key: SectionKey) {
    setOpen((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Course content</h2>
        <p className="text-xs text-muted-foreground">
          Course was created. Now add its related entities —{" "}
          <span className="font-medium text-foreground">{course.title}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Course created</span>
        <span className="text-primary">({course.slug})</span>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => {
          const isOpen = open.includes(s.key);
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="rounded-xl border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => toggle(s.key)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
              >
                <Icon size={16} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 py-3">
                  {s.key === "outcomes" && (
                    <OutcomesPanel
                      courseId={course.id}
                      items={outcomes}
                      onRefresh={onRefreshRelated}
                    />
                  )}
                  {s.key === "highlights" && (
                    <HighlightsPanel
                      courseId={course.id}
                      items={highlights}
                      onRefresh={onRefreshRelated}
                    />
                  )}
                  {s.key === "learning_points" && (
                    <LearningPointsPanel
                      courseId={course.id}
                      items={learningPoints}
                      onRefresh={onRefreshRelated}
                    />
                  )}
                  {s.key === "curriculum" && (
                    <CurriculumPanel
                      courseId={course.id}
                      modules={modules}
                      lessons={lessons}
                      videos={videos}
                      drLabs={drLabs}
                      onRefresh={onRefreshRelated}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </Button>
        <Button type="button" size="sm" onClick={onFinish}>
          <Check size={14} /> Done
        </Button>
      </div>
    </div>
  );
}
