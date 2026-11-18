import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))
const dashboard = vi.hoisted(() => ({
  saveLessonProgress: vi.fn(),
  getEnrollment: vi.fn(),
}))
vi.mock("@/actions/dashboard", () => dashboard)
vi.mock("@/actions/quizzes", () => ({
  getQuiz: vi.fn().mockResolvedValue({ ok: false, status: 403, message: "Forbidden" }),
  startQuizAttempt: vi.fn(),
  submitQuizAttempt: vi.fn(),
  getQuizAttempt: vi.fn(),
}))
vi.mock("@/components/lab/code-editor", () => ({ default: () => null }))

import CoursePlayerClient from "./CoursePlayerClient"

const LAB_LESSON_ID = "33333333-3333-3333-3333-333333333333"

const course = {
  slug: "python",
  title: "Python",
  description: "",
  resources: [],
  modules: [
    {
      id: "m1",
      title: "Module 1",
      lessons: [
        { id: "l-video", slug: "intro", title: "Intro video", lesson_type: "VIDEO", duration_in_minutes: 5, video: null, content: "" },
        {
          id: LAB_LESSON_ID, slug: "practice", title: "Practice lab", lesson_type: "LAB", duration_in_minutes: 20, video: null,
          content: "", lab: "lab-1", lab_details: { id: "lab-1", slug: "lists", title: "Lists lab", language: "python" },
        },
        { id: "l-text", slug: "reading", title: "Reading", lesson_type: "ARTICLE", duration_in_minutes: 5, video: null, content: "Hello reader" },
        { id: "l-old-quiz", slug: "old-quiz", title: "Old quiz", lesson_type: "QUIZ", duration_in_minutes: 5, video: null, content: "", quiz: null },
        { id: "l-quiz", slug: "quiz", title: "New quiz", lesson_type: "QUIZ", duration_in_minutes: 5, video: null, content: "", quiz: "q-1" },
      ],
    },
  ],
}

const enrollment = {
  completed_lesson_ids: [],
  last_lesson: null,
} as unknown as Parameters<typeof CoursePlayerClient>[0]["enrollment"]

beforeEach(() => {
  dashboard.saveLessonProgress.mockReset().mockResolvedValue(null)
  dashboard.getEnrollment.mockReset().mockResolvedValue(null)
  window.history.replaceState(null, "", "/course/python/learn")
})

function open(title: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(title) }))
}

describe("CoursePlayerClient lesson kinds", () => {
  it("keeps the existing video area and Mark as complete for a video lesson", () => {
    render(<CoursePlayerClient course={course} enrollment={enrollment} />)
    expect(screen.getByText("No valid video URL found for this lesson")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /mark as complete/i })).toBeInTheDocument()
  })

  it("opens the lab with the course and lesson, without Mark as complete", () => {
    render(<CoursePlayerClient course={course} enrollment={enrollment} />)
    open("Practice lab")
    const link = screen.getByRole("link", { name: /open the lab/i })
    expect(link).toHaveAttribute("href", `/labs/lists?course=python&lesson=${LAB_LESSON_ID}`)
    expect(screen.queryByText("No valid video URL found for this lesson")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /mark as complete/i })).not.toBeInTheDocument()
  })

  it("shows the text of a reading lesson and keeps Mark as complete", () => {
    render(<CoursePlayerClient course={course} enrollment={enrollment} />)
    open("Reading")
    expect(screen.getByText("Hello reader")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /mark as complete/i })).toBeInTheDocument()
  })

  it("renders an existing quiz lesson without quiz exactly as before", () => {
    render(<CoursePlayerClient course={course} enrollment={enrollment} />)
    open("Old quiz")
    expect(screen.getByText("No valid video URL found for this lesson")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /mark as complete/i })).toBeInTheDocument()
  })

  it("renders the quiz of a quiz lesson", async () => {
    render(<CoursePlayerClient course={course} enrollment={enrollment} />)
    open("New quiz")
    expect(await screen.findByText("Enroll in this course to take the quiz.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /mark as complete/i })).not.toBeInTheDocument()
  })
})
