import { describe, expect, it } from "vitest"

import { firstNestedError } from "./quizErrors"

describe("firstNestedError", () => {
  it("reads a DRF detail", () => {
    expect(firstNestedError({ detail: "Forbidden" })).toBe("Forbidden")
  })

  it("names the question and field of a nested error", () => {
    const data = { questions: [{}, { choices: ["Au moins 2 choix."] }] }
    expect(firstNestedError(data)).toBe("Question 2 › choices: Au moins 2 choix.")
  })

  it("reads a top-level field error", () => {
    expect(firstNestedError({ title: ["Ce champ est obligatoire."] })).toBe("title: Ce champ est obligatoire.")
  })

  it("returns null without message", () => {
    expect(firstNestedError(null)).toBeNull()
    expect(firstNestedError({ questions: [{}, {}] })).toBeNull()
  })
})
