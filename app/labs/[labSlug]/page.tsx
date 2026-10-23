import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"

import LabWorkspace from "@/components/lab/lab-workspace"
import { getLab } from "@/actions/lab-sessions"
import { requireLabSession } from "@/lib/lab/session"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ labSlug: string }>
}): Promise<Metadata> {
  const { labSlug } = await params
  const result = await getLab(labSlug)
  if (!result.ok) return { title: "Practice Lab" }
  return { title: result.lab.title }
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ labSlug: string }>
}) {
  const { labSlug } = await params
  await requireLabSession(`/labs/${labSlug}`)
  const result = await getLab(labSlug)

  // A missing lab ref stays a clean 404; any other failure (backend down,
  // network) throws so the error boundary renders with a retry button.
  if (!result.ok) {
    if (result.status === 404) notFound()
    throw new Error(result.message)
  }

  // Legacy UUID URLs still resolve through the API, then move to the slug.
  if (result.lab.slug !== labSlug) {
    redirect(`/labs/${result.lab.slug}`)
  }

  return <LabWorkspace lab={result.lab} />
}
