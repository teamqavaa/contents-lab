'use client';

import { useState, useTransition } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react';

import {
  saveQuizAction,
  type ManagedQuiz,
  type QuestionType,
  type QuizChoiceInput,
  type QuizInput,
  type QuizQuestionInput,
} from '@/actions/manageQuizzes';
import { inputClass } from './CourseForm';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single', label: 'Single choice' },
  { value: 'multiple', label: 'Multiple choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short', label: 'Short answer' },
  { value: 'code', label: 'Code' },
];

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'php', label: 'PHP' },
  { value: 'typescript', label: 'TypeScript' },
] as const;

const MAX_CODE_TESTS = 10;

function blankQuestion(type: QuestionType = 'single'): QuizQuestionInput {
  return {
    type,
    statement: '',
    points: 1,
    explanation: '',
    language: type === 'code' ? 'python' : '',
    starter_code: '',
    tests: type === 'code' ? [{ stdin: '', expected: '' }] : [],
    choices: defaultChoices(type),
  };
}

function defaultChoices(type: QuestionType): QuizChoiceInput[] {
  if (type === 'true_false') return [{ text: 'True', is_correct: true }, { text: 'False', is_correct: false }];
  if (type === 'short') return [{ text: '', is_correct: true }];
  if (type === 'code') return [];
  return [{ text: '', is_correct: true }, { text: '', is_correct: false }];
}

/** Copie éditable d'un quiz existant, ou quiz vide. */
function toInput(quiz: ManagedQuiz | null | undefined, title: string): QuizInput {
  if (!quiz) {
    return { title, description: '', pass_score: 70, max_attempts: null, time_limit_min: null, shuffle: false, questions: [blankQuestion()] };
  }
  return {
    title: quiz.title ?? title,
    description: quiz.description ?? '',
    pass_score: quiz.pass_score ?? 70,
    max_attempts: quiz.max_attempts ?? null,
    time_limit_min: quiz.time_limit_min ?? null,
    shuffle: Boolean(quiz.shuffle),
    questions: (quiz.questions ?? []).map((question) => ({
      ...question,
      explanation: question.explanation ?? '',
      starter_code: question.starter_code ?? '',
      language: question.language ?? '',
      tests: question.tests ?? [],
      choices: question.choices ?? [],
    })),
  };
}

const optionalNumber = (value: string) => (value.trim() === '' ? null : Math.max(1, Number(value)));

interface QuizEditorProps {
  quiz?: ManagedQuiz | null;
  /** Leçon à laquelle rattacher un nouveau quiz */
  lessonId: string;
  lessonTitle: string;
  onSaved: (quiz: ManagedQuiz) => void;
  onCancel: () => void;
}

/**
 * Éditeur d'un quiz : réglages, questions (ordre, points, explication), choix et bonnes réponses,
 * réponses acceptées (réponse courte), langage, code de départ et tests (code). Enregistrement en une
 * fois (questions et choix imbriqués) ; courses-api valide et revérifie les droits.
 */
export default function QuizEditor({ quiz, lessonId, lessonTitle, onSaved, onCancel }: QuizEditorProps) {
  const [draft, setDraft] = useState<QuizInput>(() => toInput(quiz, lessonTitle));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<QuizInput>) => setDraft((current) => ({ ...current, ...patch }));
  const updateQuestion = (index: number, patch: Partial<QuizQuestionInput>) =>
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, position) => (position === index ? { ...question, ...patch } : question)),
    }));
  const moveQuestion = (index: number, delta: number) =>
    setDraft((current) => {
      const questions = [...current.questions];
      const target = index + delta;
      if (target < 0 || target >= questions.length) return current;
      [questions[index], questions[target]] = [questions[target], questions[index]];
      return { ...current, questions };
    });
  const removeQuestion = (index: number) =>
    setDraft((current) => ({ ...current, questions: current.questions.filter((_, position) => position !== index) }));

  const changeType = (index: number, type: QuestionType) => {
    const question = draft.questions[index];
    const keepsChoices = ['single', 'multiple'].includes(type) && ['single', 'multiple'].includes(question.type);
    updateQuestion(index, {
      type,
      choices: keepsChoices ? question.choices : defaultChoices(type),
      language: type === 'code' ? question.language || 'python' : '',
      tests: type === 'code' ? (question.tests.length ? question.tests : [{ stdin: '', expected: '' }]) : [],
    });
  };

  const setChoice = (qIndex: number, cIndex: number, patch: Partial<QuizChoiceInput>) => {
    const question = draft.questions[qIndex];
    const single = question.type === 'single' || question.type === 'true_false';
    const choices = question.choices.map((choice, position) => {
      if (position === cIndex) return { ...choice, ...patch };
      // Choix unique : une seule bonne réponse
      return single && patch.is_correct ? { ...choice, is_correct: false } : choice;
    });
    updateQuestion(qIndex, { choices });
  };

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const payload: QuizInput = {
        ...draft,
        questions: draft.questions.map((question, index) => ({
          ...question,
          order: index + 1,
          choices: question.choices.map((choice, position) => ({ ...choice, order: position + 1 })),
        })),
      };
      const result = await saveQuizAction(payload, { quizId: quiz?.id ?? null, lessonId });
      setMessage({ ok: result.ok, text: result.message });
      if (result.ok && result.quiz) {
        // Reprend les id créés par l'API : l'enregistrement suivant met à jour au lieu de recréer
        setDraft(toInput(result.quiz, lessonTitle));
        onSaved(result.quiz);
      }
    });

  const totalPoints = draft.questions.reduce((total, question) => total + (Number(question.points) || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {quiz && quiz.attempts_count > 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {quiz.attempts_count} attempt(s) already exist: changing questions does not re-grade them.
        </p>
      )}

      <fieldset className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-neutral-700 md:col-span-2">
          Title
          <input value={draft.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700 md:col-span-2">
          Instructions
          <textarea rows={2} value={draft.description} onChange={(e) => update({ description: e.target.value })} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Pass score (%)
          <input
            type="number" min={0} max={100} value={draft.pass_score}
            onChange={(e) => update({ pass_score: Math.min(100, Math.max(0, Number(e.target.value))) })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Max attempts (empty = unlimited)
          <input
            type="number" min={1} value={draft.max_attempts ?? ''}
            onChange={(e) => update({ max_attempts: optionalNumber(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Time limit in minutes (empty = none)
          <input
            type="number" min={1} value={draft.time_limit_min ?? ''}
            onChange={(e) => update({ time_limit_min: optionalNumber(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 md:self-end">
          <input type="checkbox" checked={draft.shuffle} onChange={(e) => update({ shuffle: e.target.checked })} />
          Shuffle questions and choices
        </label>
      </fieldset>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">Questions</h3>
        <span className="text-xs text-neutral-500">{draft.questions.length} questions · {totalPoints} points</span>
      </div>

      <ol className="flex flex-col gap-4">
        {draft.questions.map((question, qIndex) => (
          <li key={question.id ?? `new-${qIndex}`} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">Q{qIndex + 1}</span>
              <select
                value={question.type}
                onChange={(e) => changeType(qIndex, e.target.value as QuestionType)}
                aria-label={`Question ${qIndex + 1} type`}
                className={`${inputClass} w-auto`}
              >
                {QUESTION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <label className="flex items-center gap-1 text-xs text-neutral-600">
                Points
                <input
                  type="number" min={1} value={question.points}
                  onChange={(e) => updateQuestion(qIndex, { points: Math.max(1, Number(e.target.value)) })}
                  aria-label={`Question ${qIndex + 1} points`}
                  className={`${inputClass} w-20`}
                />
              </label>
              <div className="ml-auto flex gap-1">
                <button type="button" className="btn btn-secondary btn-sm btn-icon" onClick={() => moveQuestion(qIndex, -1)} disabled={qIndex === 0} aria-label="Move up">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="btn btn-secondary btn-sm btn-icon" onClick={() => moveQuestion(qIndex, 1)} disabled={qIndex === draft.questions.length - 1} aria-label="Move down">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="btn btn-secondary btn-sm btn-icon !text-red-600" onClick={() => removeQuestion(qIndex)} aria-label={`Delete question ${qIndex + 1}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={2} placeholder="Question" value={question.statement}
              onChange={(e) => updateQuestion(qIndex, { statement: e.target.value })}
              aria-label={`Question ${qIndex + 1} statement`} className={inputClass}
            />

            {['single', 'multiple', 'true_false'].includes(question.type) && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-neutral-500">
                  {question.type === 'multiple' ? 'Tick every correct answer (all or nothing).' : 'Select the correct answer.'}
                </p>
                {question.choices.map((choice, cIndex) => (
                  <div key={choice.id ?? `c-${cIndex}`} className="flex items-center gap-2">
                    <input
                      type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                      name={`correct-${qIndex}`}
                      checked={choice.is_correct}
                      onChange={(e) => setChoice(qIndex, cIndex, { is_correct: e.target.checked })}
                      aria-label={`Choice ${cIndex + 1} is correct`}
                    />
                    <input
                      value={choice.text} placeholder={`Choice ${cIndex + 1}`}
                      readOnly={question.type === 'true_false'}
                      onChange={(e) => setChoice(qIndex, cIndex, { text: e.target.value })}
                      aria-label={`Question ${qIndex + 1} choice ${cIndex + 1}`} className={inputClass}
                    />
                    {question.type !== 'true_false' && question.choices.length > 2 && (
                      <button
                        type="button" className="btn btn-ghost btn-sm btn-icon" aria-label={`Remove choice ${cIndex + 1}`}
                        onClick={() => updateQuestion(qIndex, { choices: question.choices.filter((_, position) => position !== cIndex) })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {question.type !== 'true_false' && (
                  <button
                    type="button" className="btn btn-ghost btn-sm w-fit"
                    onClick={() => updateQuestion(qIndex, { choices: [...question.choices, { text: '', is_correct: false }] })}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add choice
                  </button>
                )}
              </div>
            )}

            {question.type === 'short' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-neutral-500">Accepted answers (case and extra spaces are ignored).</p>
                {question.choices.map((choice, cIndex) => (
                  <div key={choice.id ?? `a-${cIndex}`} className="flex items-center gap-2">
                    <input
                      value={choice.text} placeholder="Accepted answer"
                      onChange={(e) => setChoice(qIndex, cIndex, { text: e.target.value, is_correct: true })}
                      aria-label={`Question ${qIndex + 1} accepted answer ${cIndex + 1}`} className={inputClass}
                    />
                    {question.choices.length > 1 && (
                      <button
                        type="button" className="btn btn-ghost btn-sm btn-icon" aria-label={`Remove accepted answer ${cIndex + 1}`}
                        onClick={() => updateQuestion(qIndex, { choices: question.choices.filter((_, position) => position !== cIndex) })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button" className="btn btn-ghost btn-sm w-fit"
                  onClick={() => updateQuestion(qIndex, { choices: [...question.choices, { text: '', is_correct: true }] })}
                >
                  <Plus className="w-3.5 h-3.5" /> Add accepted answer
                </button>
              </div>
            )}

            {question.type === 'code' && (
              <div className="flex flex-col gap-2">
                <select
                  value={question.language}
                  onChange={(e) => updateQuestion(qIndex, { language: e.target.value as QuizQuestionInput['language'] })}
                  aria-label={`Question ${qIndex + 1} language`} className={`${inputClass} w-auto`}
                >
                  {LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
                </select>
                <textarea
                  rows={4} placeholder="Starter code" value={question.starter_code}
                  onChange={(e) => updateQuestion(qIndex, { starter_code: e.target.value })}
                  aria-label={`Question ${qIndex + 1} starter code`} className={`${inputClass} font-mono text-xs`}
                />
                <p className="text-xs text-neutral-500">
                  Tests: the learner&apos;s program reads the input and must print the expected output (max {MAX_CODE_TESTS}).
                </p>
                {question.tests.map((test, tIndex) => (
                  <div key={tIndex} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                    <textarea
                      rows={2} placeholder="Input (stdin)" value={test.stdin}
                      onChange={(e) => updateQuestion(qIndex, {
                        tests: question.tests.map((item, position) => (position === tIndex ? { ...item, stdin: e.target.value } : item)),
                      })}
                      aria-label={`Question ${qIndex + 1} test ${tIndex + 1} input`} className={`${inputClass} font-mono text-xs`}
                    />
                    <textarea
                      rows={2} placeholder="Expected output" value={test.expected}
                      onChange={(e) => updateQuestion(qIndex, {
                        tests: question.tests.map((item, position) => (position === tIndex ? { ...item, expected: e.target.value } : item)),
                      })}
                      aria-label={`Question ${qIndex + 1} test ${tIndex + 1} expected output`} className={`${inputClass} font-mono text-xs`}
                    />
                    <button
                      type="button" className="btn btn-ghost btn-sm btn-icon self-start" aria-label={`Remove test ${tIndex + 1}`}
                      disabled={question.tests.length <= 1}
                      onClick={() => updateQuestion(qIndex, { tests: question.tests.filter((_, position) => position !== tIndex) })}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {question.tests.length < MAX_CODE_TESTS && (
                  <button
                    type="button" className="btn btn-ghost btn-sm w-fit"
                    onClick={() => updateQuestion(qIndex, { tests: [...question.tests, { stdin: '', expected: '' }] })}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add test
                  </button>
                )}
              </div>
            )}

            <textarea
              rows={2} placeholder="Explanation shown after grading (optional)" value={question.explanation}
              onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
              aria-label={`Question ${qIndex + 1} explanation`} className={inputClass}
            />
          </li>
        ))}
      </ol>

      <button
        type="button" className="btn btn-secondary btn-sm w-fit"
        onClick={() => setDraft((current) => ({ ...current, questions: [...current.questions, blankQuestion()] }))}
      >
        <Plus className="w-3.5 h-3.5" /> Add question
      </button>

      {message && (
        <p role="status" className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={pending || !draft.title.trim()} className="btn btn-primary btn-sm">
          {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />} {quiz ? 'Save quiz' : 'Create quiz'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary btn-sm">Close</button>
      </div>
    </div>
  );
}
