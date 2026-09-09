'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, X, PlayCircle, FileText, Download,
  ChevronDown, ChevronUp, SkipBack, SkipForward
} from 'lucide-react';

interface CoursePlayerClientProps {
  course: any;
}

export default function CoursePlayerClient({ course }: CoursePlayerClientProps) {
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules.flatMap((module: any) =>
      (module.lessons || []).map((lesson: any) => ({
        ...lesson,
        moduleTitle: module.title,
        moduleId: module.id,
      }))
    );
  }, [course]);

  const initialLesson = allLessons.find((l: any) => l.lesson_type === 'VIDEO') || allLessons[0] || null;

  const [activeLesson, setActiveLesson] = useState<any>(initialLesson);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'resources'>('resources');

  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    if (initialLesson) {
      return { [initialLesson.moduleId]: true };
    }
    return { [course?.modules?.[0]?.id]: true };
  });

  useEffect(() => {
    console.log("LEÇON ACTIVE ACTUELLE :", activeLesson);
  }, [activeLesson]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const currentIndex = allLessons.findIndex((l: any) => l.id === activeLesson?.id);

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      setActiveLesson(prevLesson);
      setOpenModules(prev => ({ ...prev, [prevLesson.moduleId]: true }));
    }
  };

  const handleNextLesson = () => {
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setActiveLesson(nextLesson);
      setOpenModules(prev => ({ ...prev, [nextLesson.moduleId]: true }));
    }
  };

  const activeVideoUrl = activeLesson?.video?.video_url ? String(activeLesson.video.video_url).trim() : null;

  // MODIFICATION ICI : Ajout de 'autoplay=1' et 'cc_load_policy=0'
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&modestbranding=1&rel=0&cc_load_policy=0`
      : url;
  };

  const embedUrl = activeVideoUrl ? getYouTubeEmbedUrl(activeVideoUrl) : null;
  const currentResources = course.resources || [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-900 text-neutral-100 font-sans">

      {/* ================= 1. SIDEBAR DE GAUCHE ================= */}
      <aside className="w-[380px] bg-white text-neutral-800 border-r border-neutral-200 flex flex-col h-full z-10 shrink-0">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <Link
            href={`/course/${course.slug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <Link href="/" className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </Link>
        </div>

        <div className="p-5 border-b border-neutral-100 flex flex-col gap-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-neutral-400">Course Content</h2>
          <h1 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-1">{course.title}</h1>

          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-700">Your progress</span>
              <span className="text-neutral-400 font-medium">
                {currentIndex !== -1 ? currentIndex + 1 : 0} of {allLessons.length} lessons
              </span>
            </div>
            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / (allLessons.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {course.modules?.map((module: any, mIndex: number) => {
            const isOpen = openModules[module.id];
            const moduleNumber = String(mIndex + 1).padStart(2, '0');

            return (
              <div key={module.id} className="border border-neutral-100 rounded-2xl overflow-hidden bg-neutral-50/50">
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs text-neutral-800 hover:bg-neutral-100/80 transition-colors"
                >
                  <span className="truncate pr-2">{moduleNumber} {module.title}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>

                {isOpen && (
                  <div className="flex flex-col bg-white border-t border-neutral-100 py-1">
                    {module.lessons?.map((lesson: any) => {
                      const isSelected = activeLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors border-l-4 ${
                            isSelected
                              ? 'bg-blue-50/60 border-blue-600 text-blue-900'
                              : 'border-transparent hover:bg-neutral-50 text-neutral-600'
                          }`}
                        >
                          <div className="mt-0.5 text-neutral-400 shrink-0">
                            {lesson.lesson_type === 'VIDEO' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-900 font-bold' : 'text-neutral-800'}`}>
                              {lesson.title}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {lesson.lesson_type === 'VIDEO' ? `${lesson.duration_in_minutes || 0}:00` : lesson.lesson_type}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ================= 2. CONTENU PRINCIPAL & LECTEUR ================= */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-neutral-900">

        {/* Lecteur iframe natif ultra-stable */}
        <div className="w-full h-[400px] bg-neutral-950 relative flex items-center justify-center border-b border-neutral-800 shadow-2xl overflow-hidden shrink-0">
          {embedUrl ? (
            <iframe
              key={embedUrl} // Important pour forcer le rechargement et déclencher l'autoplay au changement de leçon
              src={embedUrl}
              title={activeLesson?.title || "Video Player"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-neutral-400 p-6 text-center">
              <PlayCircle className="w-12 h-12 text-neutral-600" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-neutral-300">Aucune URL vidéo valide trouvée pour cette leçon</p>
                <p className="text-[10px] text-red-400 max-w-sm font-mono bg-neutral-900 p-2 rounded border border-neutral-800">
                  activeVideoUrl est : {String(activeVideoUrl)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-neutral-950 px-8 py-3 border-b border-neutral-800 flex items-center justify-between text-xs">
          <button
            onClick={handlePrevLesson}
            disabled={currentIndex <= 0}
            className="flex items-center gap-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors font-semibold"
          >
            <SkipBack className="w-4 h-4" />
            <span>Leçon précédente</span>
          </button>

          <span className="text-neutral-500 font-medium">
            Leçon {currentIndex + 1} sur {allLessons.length}
          </span>

          <button
            onClick={handleNextLesson}
            disabled={currentIndex >= allLessons.length - 1}
            className="flex items-center gap-2 text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors font-semibold"
          >
            <span>Leçon suivante</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">{activeLesson?.title || course.title}</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">{activeLesson?.description || course.description}</p>
          </div>

          <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'transcript' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'notes' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'resources' ? 'bg-blue-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Resources
            </button>
          </div>

          {activeTab === 'resources' && (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-neutral-200">Download Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentResources.length > 0 ? (
                  currentResources.map((res: any) => (
                    <div key={res.id} className="bg-neutral-800/60 border border-neutral-700/60 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-neutral-700 flex items-center justify-center text-blue-400 shrink-0 font-extrabold text-xs">
                          {res.resource_type || 'DOC'}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{res.title}</h4>
                          <span className="text-[10px] text-neutral-400">{res.file_size_formatted || '94 KB'} • {res.description || 'Document officiel'}</span>
                        </div>
                      </div>
                      <a
                        href={res.file || res.external_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-neutral-700 hover:bg-blue-600 text-neutral-300 hover:text-white transition-colors shrink-0"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 text-xs py-4">Aucune ressource disponible pour ce cours pour le moment.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="text-xs text-neutral-400 leading-relaxed bg-neutral-800/40 p-6 rounded-2xl border border-neutral-800">
              Le transcript textuel de cette leçon est disponible ici.
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="flex flex-col gap-3">
              <textarea
                placeholder="Prenez vos notes personnelles ici..."
                className="w-full h-32 bg-neutral-800/40 border border-neutral-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
                Enregistrer la note
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
