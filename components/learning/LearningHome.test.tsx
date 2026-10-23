import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import LearningHome from "./LearningHome"

describe("LearningHome labs tile", () => {
  it("links the available lab count to the labs page", () => {
    render(
      <LearningHome
        user={null}
        enrollments={[]}
        stats={null}
        catalog={[]}
        labsCount={2}
      />
    )

    const link = screen.getByText("Labs").closest("a")

    expect(link).toHaveAttribute("href", "/dashboard/labs")
    expect(link).toHaveTextContent("2")
  })
})
