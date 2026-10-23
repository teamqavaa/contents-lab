import Link from "next/link"
import type { Metadata } from "next"

import { Badge } from "@/components/lab/ui/badge"
import { Button } from "@/components/lab/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/lab/ui/card"
import { getLabs } from "@/actions/lab-sessions"
import { requireLabSession } from "@/lib/lab/session"

export const metadata: Metadata = {
  title: "My Labs",
}

const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python",
  php: "PHP",
  typescript: "TypeScript",
}

export default async function DashboardLabsPage() {
  await requireLabSession("/dashboard/labs")
  const result = await getLabs()

  if (!result.ok) {
    return (
      <section className="rounded-3xl bg-white p-10 text-center">
        <p className="text-sm font-medium text-neutral-700">Could not load labs</p>
        <p className="mt-1 text-sm text-neutral-500">
          {result.message} Make sure the backend is running.
        </p>
      </section>
    )
  }

  if (result.labs.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-10 text-center">
        <p className="text-sm font-medium text-neutral-700">No labs available</p>
        <p className="mt-1 text-sm text-neutral-500">
          Publish a lab in the backend to see it here.
        </p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Labs</h1>
        <p className="text-sm text-neutral-500">
          {result.labs.length} available lab{result.labs.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {result.labs.map((lab) => (
          <Card key={lab.id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-center gap-2">
                <Badge>{LANGUAGE_LABEL[lab.language] ?? lab.language}</Badge>
                <Badge variant="outline">{lab.difficulty}</Badge>
              </div>
              <CardTitle className="text-base">{lab.title}</CardTitle>
              <CardDescription>
                {lab.steps.length} step{lab.steps.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                nativeButton={false}
                render={<Link href={`/labs/${lab.slug}`} />}
                size="sm"
              >
                Open lab
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
