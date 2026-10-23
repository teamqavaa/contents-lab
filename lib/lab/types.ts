import type { Language } from "@/lib/lab/languages"

export type LabStep = {
  id: string
  order: number
  title: string
  content: string
  hint: string | null
  starterCode: string | null
}

export type Lab = {
  id: string
  slug: string
  title: string
  language: Language
  difficulty: "guided" | "intermediate" | "advanced"
  steps: LabStep[]
}
