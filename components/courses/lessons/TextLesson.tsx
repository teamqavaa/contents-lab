'use client';

import { FileText } from 'lucide-react';

interface TextLessonProps {
  title: string;
  /** Lesson.content (texte brut ou Markdown, affiché tel quel) */
  content: string;
}

/** Leçon ARTICLE / DOCUMENT avec un contenu texte : remplace la zone vidéo du lecteur. */
export default function TextLesson({ title, content }: TextLessonProps) {
  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-800 shrink-0 flex justify-center">
      <article className="w-full max-w-3xl px-8 py-10 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <FileText className="w-4 h-4" />
          <span>Reading</span>
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="text-sm leading-7 text-neutral-200 whitespace-pre-wrap">{content}</div>
      </article>
    </div>
  );
}
