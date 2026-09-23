import LessonRow from "./LessonRow";
import type { LessonState } from "@/lib/student/lesson-status";
import type { CurriculumModule } from "@/types/student/course";

export default function ModuleGroup({
  module,
  states,
}: {
  module: CurriculumModule;
  states: Map<number, LessonState>;
}) {
  return (
    <section>
      <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Module {String(module.order).padStart(2, "0")} — {module.title}
      </h3>
      <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-card">
        {module.lessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} state={states.get(lesson.id) ?? "upcoming"} />
        ))}
      </ul>
    </section>
  );
}
