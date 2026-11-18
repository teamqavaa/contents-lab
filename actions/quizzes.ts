"use server"

// Quiz d'une leçon (courses-api, app quizzes/) : lecture sans bonnes réponses, tentatives et
// soumission. Appels côté serveur avec le cookie httpOnly access_token ; courses-api revérifie
// l'inscription au cours et corrige les réponses.

import { cookies } from "next/headers"

import { COURSES_API_URL } from "@/lib/coursesApi"

export type QuestionType = "single" | "multiple" | "true_false" | "short" | "code"

export type QuizChoice = { id: string; text: string }

export type QuizQuestion = {
  id: string
  type: QuestionType
  statement: string
  points: number
  order: number
  language: "" | "python" | "php" | "typescript"
  starter_code: string
  choices: QuizChoice[]
}

export type QuizAttempt = {
  id: string
  quiz: string
  started_at: string
  /** Date limite (ISO) si le quiz est minuté */
  deadline: string | null
  submitted_at: string | null
  // Présents seulement après la soumission
  score?: string | null
  passed?: boolean
  answers?: Record<string, unknown>
  details?: QuestionResult[]
}

export type CodeTestResult = {
  stdin: string
  expected: string
  actual?: string
  stderr?: string
  error?: string
  passed: boolean
}

export type QuestionResult = {
  question_id?: string
  type?: QuestionType
  points?: number
  earned?: number
  correct?: boolean
  explanation?: string
  correct_choice_ids?: string[]
  accepted_answers?: string[]
  tests?: CodeTestResult[]
  /** Soumission hors délai */
  expired?: boolean
}

export type Quiz = {
  id: string
  title: string
  description: string
  pass_score: number
  max_attempts: number | null
  time_limit_min: number | null
  question_count: number
  total_points: number
  lesson: { id: string; title: string; course_slug: string } | null
  questions: QuizQuestion[]
  my_attempts: {
    count: number
    remaining: number | null
    best_score: number | null
    passed: boolean
    in_progress: QuizAttempt | null
    last_submitted_id: string | null
  }
}

/** Réponse d'une question : id de choix, liste d'ids, texte ou code. */
export type QuizAnswer = string | string[]

type Result<T> = { ok: true; data: T } | { ok: false; status: number; message: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SESSION_EXPIRED = "Your session has expired. Please sign in again."
const UNREACHABLE = "The quiz service is unreachable. Please try again."

async function call<T>(path: string, options: RequestInit = {}): Promise<Result<T>> {
  const token = (await cookies()).get("access_token")?.value
  if (!token) return { ok: false, status: 401, message: SESSION_EXPIRED }

  try {
    const response = await fetch(`${COURSES_API_URL}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok) return { ok: true, data: data as T }
    if (response.status === 401) return { ok: false, status: 401, message: SESSION_EXPIRED }
    const detail = typeof data?.detail === "string" ? data.detail : null
    return { ok: false, status: response.status, message: detail || `Request failed (${response.status}).` }
  } catch (error) {
    console.error(`courses-api ${path} injoignable :`, error)
    return { ok: false, status: 0, message: UNREACHABLE }
  }
}

function invalid<T>(): Result<T> {
  return { ok: false, status: 400, message: "Invalid identifier." }
}

/** GET /api/quizzes/<id>/ : quiz et questions, sans aucune bonne réponse. */
export async function getQuiz(quizId: string): Promise<Result<Quiz>> {
  if (!UUID.test(quizId)) return invalid()
  return call<Quiz>(`/api/quizzes/${quizId}/`)
}

/** POST /api/quizzes/<id>/attempts/ : démarre une tentative ou reprend celle en cours. */
export async function startQuizAttempt(quizId: string): Promise<Result<QuizAttempt>> {
  if (!UUID.test(quizId)) return invalid()
  return call<QuizAttempt>(`/api/quizzes/${quizId}/attempts/`, { method: "POST" })
}

/** POST /api/quiz-attempts/<id>/submit/ : soumission unique, corrigée par courses-api. */
export async function submitQuizAttempt(
  attemptId: string,
  answers: Record<string, QuizAnswer>
): Promise<Result<QuizAttempt>> {
  if (!UUID.test(attemptId)) return invalid()
  return call<QuizAttempt>(`/api/quiz-attempts/${attemptId}/submit/`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  })
}

/** GET /api/quiz-attempts/<id>/ : la correction n'est renvoyée qu'après soumission. */
export async function getQuizAttempt(attemptId: string): Promise<Result<QuizAttempt>> {
  if (!UUID.test(attemptId)) return invalid()
  return call<QuizAttempt>(`/api/quiz-attempts/${attemptId}/`)
}
