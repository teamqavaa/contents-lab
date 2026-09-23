import type { CourseProgressEntry } from "@/actions/student/course-progress";
import type { Course } from "@/types/student/course";

// Visual states for a roadmap step. "upcoming" = unlocked, not yet started.
export type StepState = "completed" | "in_progress" | "upcoming" | "locked";

export type DerivedStep = {
  course: Course;
  position: number; // 1-based
  state: StepState;
  percent: number;
};

// Sequential gating mirrors the labs pattern: a step is locked until every
// step before it is completed; the first non-completed step is in progress.
export function deriveSteps(
  courses: Course[],
  progressByCourseId: Map<number, CourseProgressEntry>
): DerivedStep[] {
  let firstIncompleteSeen = false;

  return courses.map((course, index) => {
    const entry = progressByCourseId.get(course.id);

    if (entry?.status === "completed") {
      return { course, position: index + 1, state: "completed" as StepState, percent: 100 };
    }

    if (firstIncompleteSeen) {
      return { course, position: index + 1, state: "locked" as StepState, percent: 0 };
    }

    // First non-completed course becomes the active one.
    firstIncompleteSeen = true;
    return {
      course,
      position: index + 1,
      state: "in_progress" as StepState,
      percent: entry?.progress_percent ?? 0,
    };
  });
}

export function buildProgressMap(
  entries: CourseProgressEntry[]
): Map<number, CourseProgressEntry> {
  return new Map(entries.map((entry) => [entry.course_id, entry]));
}
