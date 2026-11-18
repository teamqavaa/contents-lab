import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
const manage = vi.hoisted(() => ({
  saveLessonAction: vi.fn(),
  deleteLessonAction: vi.fn(),
  saveModuleAction: vi.fn(),
  deleteModuleAction: vi.fn(),
  getLessonLabOptions: vi.fn(),
}))
vi.mock("@/actions/manageCourses", () => manage)
vi.mock("@/actions/manageQuizzes", () => ({ getManagedQuiz: vi.fn(), saveQuizAction: vi.fn() }))

import type { CatalogModule } from "@/actions/catalog"
import CurriculumEditor from "./CurriculumEditor"

const modules: CatalogModule[] = [
  {
    id: "m1", title: "Module 1", description: "", order: 1, is_published: true,
    lessons: [
      {
        id: "l-video", title: "Intro", slug: "intro", description: "", lesson_type: "VIDEO", duration_in_minutes: 5,
        order: 1, is_preview: false, is_published: true,
        video: { id: "v1", title: "Intro", provider: "YOUTUBE", video_url: "https://youtu.be/abcdefghijk" },
      },
      {
        id: "l-quiz", title: "Checkpoint", slug: "checkpoint", description: "", lesson_type: "QUIZ", duration_in_minutes: 5,
        order: 2, is_preview: false, is_published: true, video: null, quiz: null,
      },
    ],
  },
]

beforeEach(() => {
  Object.values(manage).forEach((mock) => mock.mockReset())
  manage.saveLessonAction.mockResolvedValue({ ok: true, message: "Lesson updated." })
  manage.getLessonLabOptions.mockResolvedValue([])
})

describe("CurriculumEditor lesson kinds", () => {
  it("saves a video lesson exactly as before (no content, no lab)", async () => {
    render(<CurriculumEditor courseId="c1" modules={modules} />)
    fireEvent.click(screen.getAllByRole("button", { name: /edit lesson/i })[0])
    fireEvent.click(screen.getByRole("button", { name: /save lesson/i }))

    await waitFor(() => expect(manage.saveLessonAction).toHaveBeenCalled())
    const input = manage.saveLessonAction.mock.calls[0][0]
    expect(input).toMatchObject({ id: "l-video", lesson_type: "VIDEO", video_url: "https://youtu.be/abcdefghijk", video_id: "v1" })
    expect(input.content).toBeUndefined()
    expect(input.lab).toBeUndefined()
    expect(JSON.parse(JSON.stringify(input))).not.toHaveProperty("content")
  })

  it("offers the Lab type and the quiz button for quiz lessons", () => {
    render(<CurriculumEditor courseId="c1" modules={modules} />)
    expect(screen.getByRole("button", { name: /create quiz/i })).toBeInTheDocument()
    expect(screen.getByText("no quiz")).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole("button", { name: /edit lesson/i })[0])
    expect(screen.getByRole("option", { name: "Lab" })).toBeInTheDocument()
  })
})
