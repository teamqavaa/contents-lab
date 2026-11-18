'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Clock, ListChecks, Loader2, RotateCcw, SkipForward, XCircle } from 'lucide-react';

import {
  getQuiz,
  getQuizAttempt,
  startQuizAttempt,
  submitQuizAttempt,
  type Quiz,
  type QuizAnswer,
  type QuizAttempt,
  type QuizQuestion,
  type QuestionResult,
} from '@/actions/quizzes';
import CodeEditor from '@/components/lab/code-editor';
import type { Language } from '@/lib/lab/languages';

interface QuizLessonProps {
  quizId: string;
  /** Quiz réussi : le lecteur relit la progression (la leçon est terminée par courses-api). */
  onPassed?: () => void;
  onNext?: () => void;
}

type View =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'intro' }
  | { kind: 'taking'; attempt: QuizAttempt }
  | { kind: 'result'; attempt: QuizAttempt };

/** Secondes restantes avant `deadline` (ISO), null sans limite. */
function secondsLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Réponses initiales : code de départ pour les questions de code. */
function initialAnswers(quiz: Quiz): Record<string, QuizAnswer> {
  const answers: Record<string, QuizAnswer> = {};
  quiz.questions.forEach((question) => {
    if (question.type === 'code') answers[question.id] = question.starter_code || '';
    if (question.type === 'multiple') answers[question.id] = [];
  });
  return answers;
}

export default function QuizLesson({ quizId, onPassed, onNext }: QuizLessonProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const submittedRef = useRef(false);

  const load = useCallback(async () => {
    setView({ kind: 'loading' });
    const result = await getQuiz(quizId);
    if (!result.ok) {
      setView({
        kind: 'error',
        message: result.status === 403 ? 'Enroll in this course to take the quiz.' : result.message,
      });
      return;
    }
    setQuiz(result.data);
    setAnswers(initialAnswers(result.data));
    const current = result.data.my_attempts.in_progress;
    setView(current ? { kind: 'taking', attempt: current } : { kind: 'intro' });
  }, [quizId]);

  useEffect(() => {
    // Chargement initial du quiz (server action), puis à chaque changement de quiz
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const start = async () => {
    setPending(true);
    setNotice(null);
    const result = await startQuizAttempt(quizId);
    setPending(false);
    if (!result.ok) {
      setNotice(result.status === 403 ? 'You have used all your attempts for this quiz.' : result.message);
      return;
    }
    submittedRef.current = false;
    if (quiz) setAnswers(initialAnswers(quiz));
    setView({ kind: 'taking', attempt: result.data });
  };

  const submit = useCallback(async (attempt: QuizAttempt) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setPending(true);
    setNotice(null);
    const result = await submitQuizAttempt(attempt.id, answers);
    setPending(false);
    if (!result.ok) {
      submittedRef.current = false;
      setNotice(result.message);
      return;
    }
    setView({ kind: 'result', attempt: result.data });
    if (result.data.passed) onPassed?.();
    // Compteurs de tentatives et meilleur score à jour
    const refreshed = await getQuiz(quizId);
    if (refreshed.ok) setQuiz(refreshed.data);
  }, [answers, onPassed, quizId]);

  const showLastResult = async () => {
    const last = quiz?.my_attempts.last_submitted_id;
    if (!last) return;
    const result = await getQuizAttempt(last);
    if (result.ok) setView({ kind: 'result', attempt: result.data });
    else setNotice(result.message);
  };

  // Minuteur : soumission automatique à la fin du temps imparti
  const takingAttempt = view.kind === 'taking' ? view.attempt : null;
  useEffect(() => {
    if (!takingAttempt?.deadline) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemaining(null);
      return;
    }
    const tick = () => {
      const left = secondsLeft(takingAttempt.deadline);
      setRemaining(left);
      if (left === 0) void submit(takingAttempt);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [takingAttempt, submit]);

  const setAnswer = (questionId: string, value: QuizAnswer) =>
    setAnswers((previous) => ({ ...previous, [questionId]: value }));

  const toggleChoice = (questionId: string, choiceId: string) =>
    setAnswers((previous) => {
      const current = Array.isArray(previous[questionId]) ? (previous[questionId] as string[]) : [];
      const next = current.includes(choiceId) ? current.filter((id) => id !== choiceId) : [...current, choiceId];
      return { ...previous, [questionId]: next };
    });

  const shell = (children: ReactNode) => (
    <div className="w-full bg-neutral-950 border-b border-neutral-800 shrink-0 flex justify-center">
      <section className="w-full max-w-3xl px-8 py-10 flex flex-col gap-5" aria-label="Quiz">
        {children}
        {notice && <p role="alert" className="text-sm text-amber-400">{notice}</p>}
      </section>
    </div>
  );

  if (view.kind === 'loading') {
    return shell(
      <p className="flex items-center gap-2 text-sm text-neutral-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading quiz…
      </p>,
    );
  }

  if (view.kind === 'error' || !quiz) {
    return shell(<p className="text-sm text-neutral-400">{view.kind === 'error' ? view.message : 'Quiz unavailable.'}</p>);
  }

  const attempts = quiz.my_attempts;
  const canRetry = attempts.remaining === null || attempts.remaining > 0;
  const header = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
        <ListChecks className="w-4 h-4" />
        <span>Quiz · {quiz.question_count} questions · pass at {quiz.pass_score}%</span>
      </div>
      <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
    </div>
  );

  if (view.kind === 'intro') {
    return shell(
      <>
        {header}
        {quiz.description && <p className="text-sm text-neutral-300 whitespace-pre-wrap">{quiz.description}</p>}
        <ul className="text-sm text-neutral-300 flex flex-col gap-1">
          {quiz.time_limit_min && <li>Time limit: {quiz.time_limit_min} min</li>}
          <li>
            Attempts: {attempts.count}
            {quiz.max_attempts !== null ? ` of ${quiz.max_attempts}` : ''}
          </li>
          {attempts.best_score !== null && <li>Best score: {attempts.best_score}%</li>}
        </ul>
        {attempts.passed && (
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Quiz passed
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {canRetry ? (
            <button type="button" onClick={start} disabled={pending} className="btn btn-primary">
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {attempts.count ? 'Try again' : 'Start quiz'}
            </button>
          ) : (
            <p className="text-sm text-neutral-400">No attempts left.</p>
          )}
          {attempts.last_submitted_id && (
            <button type="button" onClick={showLastResult} className="btn btn-secondary">View last result</button>
          )}
          {attempts.passed && onNext && (
            <button type="button" onClick={onNext} className="btn btn-secondary">
              Next lesson <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>
      </>,
    );
  }

  if (view.kind === 'taking') {
    return shell(
      <>
        <div className="flex items-start justify-between gap-4">
          {header}
          {remaining !== null && (
            <p
              className={`flex items-center gap-1.5 text-sm font-bold tabular-nums ${remaining < 60 ? 'text-red-400' : 'text-neutral-200'}`}
              aria-label="Time left"
            >
              <Clock className="w-4 h-4" /> {formatClock(remaining)}
            </p>
          )}
        </div>
        <ol className="flex flex-col gap-6">
          {quiz.questions.map((question, index) => (
            <QuestionField
              key={question.id}
              index={index}
              question={question}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
              onToggle={(choiceId) => toggleChoice(question.id, choiceId)}
            />
          ))}
        </ol>
        <div>
          <button type="button" onClick={() => submit(view.attempt)} disabled={pending} className="btn btn-primary">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />} Submit answers
          </button>
        </div>
      </>,
    );
  }

  // Résultat
  const { attempt } = view;
  const results = new Map((attempt.details || []).map((item) => [item.question_id, item]));
  const expired = attempt.details?.some((item) => item.expired);
  return shell(
    <>
      {header}
      <div
        className={`flex items-center gap-3 rounded-[var(--radius-btn)] border p-4 ${attempt.passed ? 'border-emerald-700 bg-emerald-950/40' : 'border-red-800 bg-red-950/30'}`}
      >
        {attempt.passed ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
        <div>
          <p className="text-lg font-bold text-white">{Number(attempt.score ?? 0)}%</p>
          <p className="text-xs text-neutral-300">
            {expired ? 'Time is up: this attempt was submitted too late.' : attempt.passed ? 'Passed — this lesson is complete.' : `You need ${quiz.pass_score}% to pass.`}
          </p>
        </div>
      </div>
      {!expired && (
        <ol className="flex flex-col gap-4">
          {quiz.questions.map((question, index) => (
            <QuestionReview key={question.id} index={index} question={question} result={results.get(question.id)} />
          ))}
        </ol>
      )}
      <div className="flex flex-wrap gap-2">
        {!attempt.passed && canRetry && (
          <button type="button" onClick={start} disabled={pending} className="btn btn-primary">
            <RotateCcw className="w-4 h-4" /> Try again
          </button>
        )}
        {attempt.passed && onNext && (
          <button type="button" onClick={onNext} className="btn btn-primary">
            Next lesson <SkipForward className="w-4 h-4" />
          </button>
        )}
        <button type="button" onClick={() => setView({ kind: 'intro' })} className="btn btn-secondary">Back to quiz</button>
      </div>
    </>,
  );
}

function QuestionField({
  index,
  question,
  value,
  onChange,
  onToggle,
}: {
  index: number;
  question: QuizQuestion;
  value: QuizAnswer | undefined;
  onChange: (value: QuizAnswer) => void;
  onToggle: (choiceId: string) => void;
}) {
  const name = `question-${question.id}`;
  return (
    <li className="flex flex-col gap-3 rounded-[var(--radius-btn)] border border-neutral-800 bg-neutral-900/60 p-4">
      <p className="text-sm font-semibold text-white whitespace-pre-wrap">
        {index + 1}. {question.statement}
        <span className="ml-2 text-xs font-normal text-neutral-500">
          {question.points} pt{question.points > 1 ? 's' : ''}
        </span>
      </p>

      {(question.type === 'single' || question.type === 'true_false') && (
        <div role="radiogroup" className="flex flex-col gap-2">
          {question.choices.map((choice) => (
            <label key={choice.id} className="flex items-center gap-2 text-sm text-neutral-200">
              <input type="radio" name={name} checked={value === choice.id} onChange={() => onChange(choice.id)} />
              {choice.text}
            </label>
          ))}
        </div>
      )}

      {question.type === 'multiple' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-neutral-500">Select all that apply.</p>
          {question.choices.map((choice) => (
            <label key={choice.id} className="flex items-center gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(choice.id)}
                onChange={() => onToggle(choice.id)}
              />
              {choice.text}
            </label>
          ))}
        </div>
      )}

      {question.type === 'short' && (
        <input
          type="text"
          aria-label={`Answer to question ${index + 1}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-[var(--radius-btn)] border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      )}

      {question.type === 'code' && question.language && (
        <div className="h-56 rounded-[var(--radius-btn)] border border-neutral-700 overflow-hidden">
          <CodeEditor
            language={question.language as Language}
            value={typeof value === 'string' ? value : ''}
            onChange={(code) => onChange(code)}
          />
        </div>
      )}
    </li>
  );
}

function QuestionReview({
  index,
  question,
  result,
}: {
  index: number;
  question: QuizQuestion;
  result: QuestionResult | undefined;
}) {
  const correctIds = new Set(result?.correct_choice_ids ?? []);
  return (
    <li className="flex flex-col gap-2 rounded-[var(--radius-btn)] border border-neutral-800 bg-neutral-900/60 p-4">
      <p className="flex items-start gap-2 text-sm font-semibold text-white">
        {result?.correct ? (
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" aria-label="Correct" />
        ) : (
          <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" aria-label="Incorrect" />
        )}
        <span className="whitespace-pre-wrap">
          {index + 1}. {question.statement}
        </span>
        <span className="ml-auto text-xs font-normal text-neutral-400">
          {result?.earned ?? 0}/{question.points}
        </span>
      </p>
      {correctIds.size > 0 && (
        <p className="text-xs text-neutral-300">
          Correct answer: {question.choices.filter((choice) => correctIds.has(choice.id)).map((choice) => choice.text).join(', ')}
        </p>
      )}
      {result?.accepted_answers && result.accepted_answers.length > 0 && (
        <p className="text-xs text-neutral-300">Accepted answers: {result.accepted_answers.join(', ')}</p>
      )}
      {result?.tests && (
        <ul className="flex flex-col gap-1 text-xs font-mono">
          {result.tests.map((test, position) => (
            <li key={position} className={test.passed ? 'text-emerald-400' : 'text-red-400'}>
              Test {position + 1}: {test.passed ? 'passed' : test.error ? `error — ${test.error}` : `expected "${test.expected}", got "${test.actual ?? ''}"`}
            </li>
          ))}
        </ul>
      )}
      {result?.explanation && <p className="text-xs text-neutral-400 whitespace-pre-wrap">{result.explanation}</p>}
    </li>
  );
}
