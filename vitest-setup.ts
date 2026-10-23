import { afterEach, beforeAll } from "vitest"
import "@testing-library/jest-dom/vitest"

beforeAll(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false }))
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  if (!Element.prototype.getAnimations) {
    Object.defineProperty(Element.prototype, "getAnimations", {
      configurable: true,
      value: () => [],
    })
  }
})

afterEach(() => {
  document.body.innerHTML = ""
  window.localStorage.clear()
})
