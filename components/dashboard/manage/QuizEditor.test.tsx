import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const actions = vi.hoisted(() => ({ saveQuizAction: vi.fn() }))
vi.mock("@/actions/manageQuizzes", () => actions)

import type { ManagedQuiz } from "@/actions/manageQuizzes"
import QuizEditor from "./QuizEditor"

const LESSON_ID = "44444444-4444-4444-4444-444444444444"

beforeEach(() => {
  actions.saveQuizAction.mockReset()
})

describe("QuizEditor", () => {
  it("creates a quiz with a single-choice and a code question for the lesson", async () => {
    const saved = { id: "q1", title: "Checkpoint", questions: [] } as unknown as ManagedQuiz
    actions.saveQuizAction.mockResolvedValue({ ok: true, message: "Quiz created.", quiz: saved })
    const onSaved = vi.fn()
    render(<QuizEditor lessonId={LESSON_ID} lessonTitle="Checkpoint" onSaved={onSaved} onCancel={() => {}} />)

    fireEvent.change(screen.getByLabelText("Question 1 statement"), { target: { value: "2 + 2 ?" } })
    fireEvent.change(screen.getByLabelText("Question 1 choice 1"), { target: { value: "5" } })
    fireEvent.change(screen.getByLabelText("Question 1 choice 2"), { target: { value: "4" } })
    // Choix unique : cocher le 2e décoche le 1er
    fireEvent.click(screen.getAllByLabelText("Choice 2 is correct")[0])

    fireEvent.click(screen.getByRole("button", { name: /add question/i }))
    fireEvent.change(screen.getByLabelText("Question 2 type"), { target: { value: "code" } })
    fireEvent.change(screen.getByLabelText("Question 2 statement"), { target: { value: "Double it" } })
    fireEvent.change(screen.getByLabelText("Question 2 test 1 input"), { target: { value: "2" } })
    fireEvent.change(screen.getByLabelText("Question 2 test 1 expected output"), { target: { value: "4" } })

    fireEvent.click(screen.getByRole("button", { name: /create quiz/i }))
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(saved))

    const [payload, target] = actions.saveQuizAction.mock.calls[0]
    expect(target).toEqual({ quizId: null, lessonId: LESSON_ID })
    expect(payload.title).toBe("Checkpoint")
    expect(payload.questions[0]).toMatchObject({
      type: "single",
      statement: "2 + 2 ?",
      order: 1,
      choices: [
        { text: "5", is_correct: false, order: 1 },
        { text: "4", is_correct: true, order: 2 },
      ],
    })
    expect(payload.questions[1]).toMatchObject({
      type: "code",
      language: "python",
      order: 2,
      tests: [{ stdin: "2", expected: "4" }],
      choices: [],
    })
  })

  it("updates an existing quiz and shows API errors", async () => {
    actions.saveQuizAction.mockResolvedValue({ ok: false, message: "Question 1 › choices: Au moins 2 choix." })
    const quiz = {
      id: "55555555-5555-5555-5555-555555555555", title: "Old", description: "", pass_score: 80, max_attempts: 2,
      time_limit_min: null, shuffle: false, created_by: "x", attempts_count: 3, lesson: null,
      questions: [{
        id: "qq", type: "short", statement: "Capital?", points: 1, order: 1, explanation: "", language: "",
        starter_code: "", tests: [], choices: [{ id: "cc", text: "Paris", is_correct: true, order: 1 }],
      }],
    } satisfies ManagedQuiz
    render(<QuizEditor quiz={quiz} lessonId={LESSON_ID} lessonTitle="Lesson" onSaved={vi.fn()} onCancel={() => {}} />)

    expect(screen.getByText(/3 attempt\(s\) already exist/)).toBeInTheDocument()
    expect(screen.getByLabelText("Question 1 accepted answer 1")).toHaveValue("Paris")
    fireEvent.click(screen.getByRole("button", { name: /save quiz/i }))

    expect(await screen.findByText("Question 1 › choices: Au moins 2 choix.")).toBeInTheDocument()
    const [payload, target] = actions.saveQuizAction.mock.calls[0]
    expect(target.quizId).toBe(quiz.id)
    expect(payload.questions[0].id).toBe("qq")
    expect(payload.questions[0].choices[0].id).toBe("cc")
  })
})
