import type { CurriculumLesson } from "@/types/student/course";

export type LessonState = "completed" | "current" | "locked" | "upcoming";

// Course-level percent stands in for lesson rows until LessonCompletion
// lands in phase two: the first N lessons count as done, the next one is
// current and the rest stay locked. Swap the input source later; consumers
// keep working unchanged.
export function deriveLessonStates(
  lessons: CurriculumLesson[],
  percent: number
): Map<number, LessonState> {
  const states = new Map<number, LessonState>();
  if (lessons.length === 0) {
    return states;
  }

  const clamped = Math.min(Math.max(percent, 0), 100);
  const completedCount = Math.floor((clamped / 100) * lessons.length);

  let currentAssigned = false;
  lessons.forEach((lesson, index) => {
    if (index < completedCount || clamped >= 100) {
      states.set(lesson.id, "completed");
      return;
    }
    if (!currentAssigned && clamped > 0) {
      states.set(lesson.id, "current");
      currentAssigned = true;
      return;
    }
    if (currentAssigned) {
      states.set(lesson.id, "locked");
      return;
    }
    // No progress yet: everything stays unlocked and unstarted.
    states.set(lesson.id, "upcoming");
  });

  return states;
}
