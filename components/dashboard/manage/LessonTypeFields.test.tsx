import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const manage = vi.hoisted(() => ({ getLessonLabOptions: vi.fn() }))
vi.mock("@/actions/manageCourses", () => manage)

import type { CatalogLesson } from "@/actions/catalog"
import LessonTypeFields from "./LessonTypeFields"

function renderForm(lesson?: CatalogLesson) {
  render(
    <form aria-label="lesson">
      <select name="lesson_type" defaultValue={lesson?.lesson_type ?? "VIDEO"} aria-label="Lesson type">
        <option value="VIDEO">Video</option>
        <option value="ARTICLE">Article</option>
        <option value="QUIZ">Quiz</option>
        <option value="LAB">Lab</option>
      </select>
      <LessonTypeFields lesson={lesson} />
    </form>
  )
  return screen.getByRole("form", { name: "lesson" }) as HTMLFormElement
}

const changeType = (value: string) =>
  fireEvent.change(screen.getByLabelText("Lesson type"), { target: { value } })

beforeEach(() => {
  manage.getLessonLabOptions.mockReset().mockResolvedValue([
    { id: "lab-1", slug: "lists", title: "Lists", language: "python" },
  ])
})

describe("LessonTypeFields", () => {
  it("adds nothing to a video lesson form", () => {
    const form = renderForm()
    const data = new FormData(form)
    expect(data.has("content")).toBe(false)
    expect(data.has("lab")).toBe(false)
  })

  it("shows the text field for an article", () => {
    const form = renderForm()
    changeType("ARTICLE")
    fireEvent.change(screen.getByLabelText("Lesson text"), { target: { value: "Hello" } })
    expect(new FormData(form).get("content")).toBe("Hello")
  })

  it("lists published labs for a lab lesson and keeps the current lab selected", async () => {
    const lesson = {
      id: "l1", title: "Practice", slug: null, description: "", lesson_type: "LAB", duration_in_minutes: 0,
      order: 1, is_preview: false, is_published: true, video: null, lab: "lab-1",
      lab_details: { id: "lab-1", slug: "lists", title: "Lists", language: "python" },
    } satisfies CatalogLesson
    const form = renderForm(lesson)
    const select = await screen.findByLabelText("Practice lab")
    expect(select).toHaveValue("lab-1")
    expect(new FormData(form).get("lab")).toBe("lab-1")
    expect(manage.getLessonLabOptions).toHaveBeenCalledTimes(1)
  })

  it("explains where to edit the quiz", () => {
    renderForm()
    changeType("QUIZ")
    expect(screen.getByText(/create quiz/i)).toBeInTheDocument()
  })
})
