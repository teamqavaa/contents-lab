import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
  searchParams,
}: {
  params: Promise<{ labSlug: string }>
  // Ouvert depuis une leçon LAB du lecteur : ?course=<slug du cours>&lesson=<id de la leçon>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
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

  // Retour vers la leçon du cours (chemin interne construit ici, paramètres validés)
  const query = (await searchParams) ?? {}
  const course = typeof query.course === "string" ? query.course : ""
  const lesson = typeof query.lesson === "string" ? query.lesson : ""
  if (/^[a-z0-9-]+$/i.test(course) && /^[0-9a-f-]{36}$/i.test(lesson)) {
    return (
      <>
        <LabWorkspace lab={result.lab} />
        <Link
          href={`/course/${course}/learn#${lesson}`}
          className="btn btn-dark btn-sm fixed bottom-4 left-4 z-50 shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" /> Back to lesson
        </Link>
      </>
    )
  }

  return <LabWorkspace lab={result.lab} />
}
