"use server"

import { cookies } from "next/headers"

import { COURSES_API_URL } from "@/lib/coursesApi"
import type { Language } from "@/lib/lab/languages"
import type { Lab, LabStep } from "@/lib/lab/types"

type ApiObjective = {
  id: string
  order: number
  title: string
  content: string
  hint: string | null
  starter_code: string | null
}

type ApiLab = {
  id: string
  slug: string
  title: string
  description: string | null
  language: Language
  status: string
  difficulty: Lab["difficulty"]
  objectives: ApiObjective[]
}

const UNAUTHORIZED_MESSAGE = "Your session has expired. Please sign in again."

function toLab(apiLab: ApiLab): Lab {
  const steps: LabStep[] = apiLab.objectives
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((objective) => ({
      id: objective.id,
      order: objective.order,
      title: objective.title,
      content: objective.content,
      hint: objective.hint,
      starterCode: objective.starter_code || null,
    }))

  return {
    id: apiLab.id,
    slug: apiLab.slug,
    title: apiLab.title,
    language: apiLab.language,
    difficulty: apiLab.difficulty,
    steps,
  }
}

async function accessToken(): Promise<string | null> {
  return (await cookies()).get("access_token")?.value ?? null
}

async function publicFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${COURSES_API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
  })
}

async function authedFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const token = await accessToken()
  if (!token) return null

  return fetch(`${COURSES_API_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  })
}

export type GetLabSessionResult =
  | {
      ok: true
      currentCode: string | null
      status: string
      completedSteps: number
      practiceSeconds: number
      attempts: number
      lastActiveAt: string | null
    }
  | { ok: false; message: string; unauthorized?: boolean }

export async function getLabSession(labId: string): Promise<GetLabSessionResult> {
  try {
    const res = await authedFetch(`/api/sessions/${labId}/`)
    if (!res) return { ok: false, message: UNAUTHORIZED_MESSAGE, unauthorized: true }
    if (res.status === 401) {
      return { ok: false, message: UNAUTHORIZED_MESSAGE, unauthorized: true }
    }
    if (!res.ok) {
      return { ok: false, message: `Session load failed (status ${res.status})` }
    }
    const data = await res.json()
    return {
      ok: true,
      currentCode: data.current_code ?? null,
      status: data.status,
      completedSteps: data.completed_steps ?? 0,
      practiceSeconds: data.practice_seconds ?? 0,
      attempts: data.attempts ?? 0,
      lastActiveAt: data.last_active_at ?? null,
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

export type SaveLabSessionResult =
  | {
      ok: true
      status: string
      completedSteps: number
      practiceSeconds: number
      attempts: number
      lastActiveAt: string
    }
  | { ok: false; message: string; unauthorized?: boolean }

export async function saveLabSession(
  labId: string,
  currentCode: string,
  completedSteps?: number
): Promise<SaveLabSessionResult> {
  try {
    const res = await authedFetch(`/api/sessions/${labId}/`, {
      method: "POST",
      body: JSON.stringify({
        current_code: currentCode,
        completed_steps: completedSteps,
      }),
    })
    if (!res) return { ok: false, message: UNAUTHORIZED_MESSAGE, unauthorized: true }
    if (res.status === 401) {
      return { ok: false, message: UNAUTHORIZED_MESSAGE, unauthorized: true }
    }
    if (!res.ok) {
      return { ok: false, message: `Save failed (status ${res.status})` }
    }
    const data = await res.json()
    return {
      ok: true,
      status: data.status,
      completedSteps: data.completed_steps ?? 0,
      practiceSeconds: data.practice_seconds ?? 0,
      attempts: data.attempts ?? 0,
      lastActiveAt: data.last_active_at,
    }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

export async function sendLabHeartbeat(labId: string): Promise<{ ok: boolean }> {
  try {
    const res = await authedFetch(`/api/sessions/${labId}/heartbeat/`, {
      method: "POST",
    })
    return { ok: Boolean(res?.ok) }
  } catch {
    return { ok: false }
  }
}

export type GetLabResult =
  | { ok: true; lab: Lab }
  | { ok: false; status: number; message: string }

export async function getLab(labRef: string): Promise<GetLabResult> {
  try {
    const res = await publicFetch(`/api/labs/${encodeURIComponent(labRef)}/`)
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: `Lab load failed (status ${res.status})`,
      }
    }
    const apiLab: ApiLab = await res.json()
    return { ok: true, lab: toLab(apiLab) }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

export type GetLabsResult =
  | { ok: true; labs: Lab[] }
  | { ok: false; message: string }

export async function getLabs(): Promise<GetLabsResult> {
  try {
    const res = await publicFetch(`/api/labs/`)
    if (!res.ok) {
      return { ok: false, message: `Lab list failed (status ${res.status})` }
    }
    const apiLabs: ApiLab[] = await res.json()
    return { ok: true, labs: apiLabs.map(toLab) }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

export type ExecuteLabParams = {
  language: Language
  version: string
  filename: string
  code: string
}

export type ExecuteLabResult =
  | { ok: true; stdout: string; stderr: string; exitCode: number | null }
  | { ok: false; kind: "rate_limited"; message: string }
  | { ok: false; kind: "validation"; message: string }
  | { ok: false; kind: "timeout"; message: string }
  | { ok: false; kind: "piston_unreachable"; message: string }
  | { ok: false; kind: "network"; message: string }
  | { ok: false; kind: "unauthorized"; message: string }
  | { ok: false; kind: "unexpected"; message: string }

export async function executeLab(params: ExecuteLabParams): Promise<ExecuteLabResult> {
  let res: Response | null
  try {
    res = await authedFetch("/api/execute/", {
      method: "POST",
      body: JSON.stringify(params),
    })
  } catch (err) {
    return {
      ok: false,
      kind: "network",
      message: err instanceof Error ? err.message : "Network request failed",
    }
  }

  if (!res) {
    return { ok: false, kind: "unauthorized", message: UNAUTHORIZED_MESSAGE }
  }

  if (res.status === 401) {
    return { ok: false, kind: "unauthorized", message: UNAUTHORIZED_MESSAGE }
  }

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}))
    return {
      ok: false,
      kind: "rate_limited",
      message: data.error || "Rate limit exceeded. Please wait before running again.",
    }
  }

  if (res.status === 400) {
    const data = await res.json().catch(() => ({}))
    return {
      ok: false,
      kind: "validation",
      message:
        data.error || "Invalid request — check language, version, filename, and code.",
    }
  }

  if (res.status === 504) {
    return { ok: false, kind: "timeout", message: "Execution timed out." }
  }

  if (res.status === 502) {
    const data = await res.json().catch(() => ({}))
    return {
      ok: false,
      kind: "piston_unreachable",
      message: data.error || "Could not reach the code execution service.",
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return { ok: false, kind: "unexpected", message: `Status ${res.status}: ${text}` }
  }

  const data = await res.json().catch(() => null)
  if (!data || !data.run) {
    return {
      ok: false,
      kind: "unexpected",
      message: "Unexpected response format from execution API.",
    }
  }

  return {
    ok: true,
    stdout: data.run.stdout || "",
    stderr: data.run.stderr || "",
    exitCode: data.run.code ?? null,
  }
}

export type CompleteLabResult =
  | { ok: true }
  | { ok: false; message: string; unauthorized?: boolean }

export async function completeLab(labId: string): Promise<CompleteLabResult> {
  return sessionAction(labId, "complete")
}

export async function uncompleteLab(labId: string): Promise<CompleteLabResult> {
  return sessionAction(labId, "uncomplete")
}

export async function resetLabSession(labId: string): Promise<CompleteLabResult> {
  return sessionAction(labId, "reset")
}

async function sessionAction(
  labId: string,
  action: "complete" | "uncomplete" | "reset"
): Promise<CompleteLabResult> {
  try {
    const res = await authedFetch(`/api/sessions/${labId}/${action}/`, {
      method: "POST",
    })
    if (!res) return { ok: false, message: UNAUTHORIZED_MESSAGE, unauthorized: true }
    if (res.status === 401) {
      return { ok: false, message: UNAUTHORIZED_MESSAGE, unauthorized: true }
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return {
        ok: false,
        message: data.message || data.error || `${action} failed (status ${res.status})`,
      }
    }
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
