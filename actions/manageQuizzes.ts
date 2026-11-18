'use server';

// ---- Gestion des quiz (instructeurs : leurs quiz et ceux de leurs cours ; administrateurs : tous) ----
// courses-api (quizzes/permissions.py) vérifie tous les droits : le front ne fait que masquer.

import { revalidatePath } from 'next/cache';

import { apiCall } from '@/lib/manageApi';
import { firstNestedError } from '@/lib/quizErrors';

export type QuestionType = 'single' | 'multiple' | 'true_false' | 'short' | 'code';

export interface QuizChoiceInput {
  id?: string;
  text: string;
  is_correct: boolean;
  order?: number;
}

export interface QuizTestInput {
  stdin: string;
  expected: string;
}

export interface QuizQuestionInput {
  id?: string;
  type: QuestionType;
  statement: string;
  points: number;
  order?: number;
  explanation: string;
  language: '' | 'python' | 'php' | 'typescript';
  starter_code: string;
  tests: QuizTestInput[];
  choices: QuizChoiceInput[];
}

export interface QuizInput {
  title: string;
  description: string;
  pass_score: number;
  max_attempts: number | null;
  time_limit_min: number | null;
  shuffle: boolean;
  questions: QuizQuestionInput[];
}

export interface ManagedQuiz extends QuizInput {
  id: string;
  created_by: string;
  attempts_count: number;
  lesson: { id: string; title: string; course_slug: string } | null;
}

export interface QuizActionResult {
  ok: boolean;
  message: string;
  quiz?: ManagedQuiz;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MANAGE_PATH = '/dashboard/manage-courses';

function failure(data: unknown): QuizActionResult {
  return { ok: false, message: firstNestedError(data) || 'The request failed, please try again.' };
}

/** GET /api/quizzes/manage/<id>/ : quiz complet (bonnes réponses, tests) pour l'éditeur. */
export async function getManagedQuiz(quizId: string): Promise<ManagedQuiz | null> {
  if (!UUID.test(quizId)) return null;
  const response = await apiCall(`/api/quizzes/manage/${quizId}/`);
  return response.ok ? (response.data as ManagedQuiz) : null;
}

/**
 * Crée (POST) ou met à jour (PATCH) un quiz et ses questions. À la création, le quiz est rattaché à la
 * leçon `lessonId` (PATCH /api/lessons/<id>/ {quiz}).
 */
export async function saveQuizAction(
  input: QuizInput,
  target: { quizId?: string | null; lessonId?: string | null } = {},
): Promise<QuizActionResult> {
  const { quizId, lessonId } = target;
  if ((quizId && !UUID.test(quizId)) || (lessonId && !UUID.test(lessonId))) {
    return { ok: false, message: 'Invalid identifier.' };
  }

  const response = await apiCall(quizId ? `/api/quizzes/manage/${quizId}/` : '/api/quizzes/manage/', {
    method: quizId ? 'PATCH' : 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) return failure(response.data);
  const quiz = response.data as ManagedQuiz;

  if (!quizId && lessonId) {
    const link = await apiCall(`/api/lessons/${lessonId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quiz: quiz.id }),
    });
    if (!link.ok) {
      return { ok: false, quiz, message: `Quiz saved, but it could not be attached to the lesson — ${failure(link.data).message}` };
    }
  }

  revalidatePath(MANAGE_PATH, 'layout');
  return { ok: true, quiz, message: quizId ? 'Quiz updated.' : 'Quiz created.' };
}
