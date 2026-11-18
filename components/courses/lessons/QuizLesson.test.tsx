import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Quiz, QuizAttempt } from "@/actions/quizzes"

const actions = vi.hoisted(() => ({
  getQuiz: vi.fn(),
  startQuizAttempt: vi.fn(),
  submitQuizAttempt: vi.fn(),
  getQuizAttempt: vi.fn(),
}))
vi.mock("@/actions/quizzes", () => actions)
vi.mock("@/components/lab/code-editor", () => ({
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea aria-label="Code editor" value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}))

import QuizLesson from "./QuizLesson"

const QUIZ_ID = "11111111-1111-1111-1111-111111111111"

function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: QUIZ_ID,
    title: "Python basics",
    description: "",
    pass_score: 70,
    max_attempts: null,
    time_limit_min: null,
    question_count: 3,
    total_points: 3,
    lesson: null,
    questions: [
      {
        id: "q-single", type: "single", statement: "2 + 2 ?", points: 1, order: 1, language: "", starter_code: "",
        choices: [{ id: "c-4", text: "4" }, { id: "c-5", text: "5" }],
      },
      { id: "q-short", type: "short", statement: "Capital of France?", points: 1, order: 2, language: "", starter_code: "", choices: [] },
      { id: "q-code", type: "code", statement: "Double it", points: 1, order: 3, language: "python", starter_code: "n = 1", choices: [] },
    ],
    my_attempts: { count: 0, remaining: null, best_score: null, passed: false, in_progress: null, last_submitted_id: null },
    ...overrides,
  }
}

const attempt: QuizAttempt = {
  id: "22222222-2222-2222-2222-222222222222", quiz: QUIZ_ID, started_at: new Date().toISOString(),
  deadline: null, submitted_at: null,
}

beforeEach(() => {
  Object.values(actions).forEach((mock) => mock.mockReset())
})

describe("QuizLesson", () => {
  it("starts an attempt, sends the answers and shows the passed result", async () => {
    actions.getQuiz.mockResolvedValue({ ok: true, data: makeQuiz() })
    actions.startQuizAttempt.mockResolvedValue({ ok: true, data: attempt })
    actions.submitQuizAttempt.mockResolvedValue({
      ok: true,
      data: {
        ...attempt, submitted_at: new Date().toISOString(), score: "100.00", passed: true,
        details: [{ question_id: "q-single", correct: true, earned: 1, correct_choice_ids: ["c-4"], explanation: "Four." }],
      },
    })
    const onPassed = vi.fn()
    const onNext = vi.fn()
    render(<QuizLesson quizId={QUIZ_ID} onPassed={onPassed} onNext={onNext} />)

    fireEvent.click(await screen.findByRole("button", { name: /start quiz/i }))
    fireEvent.click(await screen.findByLabelText("4"))
    fireEvent.change(screen.getByLabelText("Answer to question 2"), { target: { value: "Paris" } })
    fireEvent.click(screen.getByRole("button", { name: /submit answers/i }))

    await screen.findByText("100%")
    expect(actions.submitQuizAttempt).toHaveBeenCalledWith(attempt.id, {
      "q-single": "c-4",
      "q-short": "Paris",
      "q-code": "n = 1",
    })
    expect(onPassed).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Four.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /next lesson/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it("does not call onPassed and offers a retry when the quiz is failed", async () => {
    actions.getQuiz.mockResolvedValue({ ok: true, data: makeQuiz() })
    actions.startQuizAttempt.mockResolvedValue({ ok: true, data: attempt })
    actions.submitQuizAttempt.mockResolvedValue({
      ok: true,
      data: { ...attempt, submitted_at: new Date().toISOString(), score: "0.00", passed: false, details: [] },
    })
    const onPassed = vi.fn()
    render(<QuizLesson quizId={QUIZ_ID} onPassed={onPassed} />)

    fireEvent.click(await screen.findByRole("button", { name: /start quiz/i }))
    fireEvent.click(await screen.findByRole("button", { name: /submit answers/i }))

    await screen.findByText("You need 70% to pass.")
    expect(onPassed).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()
  })

  it("resumes an attempt in progress and shows the timer", async () => {
    const deadline = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    actions.getQuiz.mockResolvedValue({
      ok: true,
      data: makeQuiz({
        time_limit_min: 5,
        my_attempts: { count: 1, remaining: null, best_score: null, passed: false, in_progress: { ...attempt, deadline }, last_submitted_id: null },
      }),
    })
    render(<QuizLesson quizId={QUIZ_ID} />)

    expect(await screen.findByRole("button", { name: /submit answers/i })).toBeInTheDocument()
    expect(screen.getByLabelText("Time left")).toHaveTextContent(/[45]:\d\d/)
    expect(actions.startQuizAttempt).not.toHaveBeenCalled()
  })

  it("hides the start button when no attempts are left", async () => {
    actions.getQuiz.mockResolvedValue({
      ok: true,
      data: makeQuiz({
        max_attempts: 1,
        my_attempts: { count: 1, remaining: 0, best_score: 40, passed: false, in_progress: null, last_submitted_id: attempt.id },
      }),
    })
    render(<QuizLesson quizId={QUIZ_ID} />)

    expect(await screen.findByText("No attempts left.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /start quiz|try again/i })).not.toBeInTheDocument()
    expect(screen.getByText("Best score: 40%")).toBeInTheDocument()
  })

  it("explains that enrollment is required when the API refuses access", async () => {
    actions.getQuiz.mockResolvedValue({ ok: false, status: 403, message: "Forbidden" })
    render(<QuizLesson quizId={QUIZ_ID} />)
    await waitFor(() => expect(screen.getByText("Enroll in this course to take the quiz.")).toBeInTheDocument())
  })
})
