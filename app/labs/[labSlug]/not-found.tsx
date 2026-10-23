import Link from "next/link"
import { FlaskConical } from "lucide-react"

import { Button } from "@/components/lab/ui/button"

export default function LabNotFound() {
  return (
    <div className="lab-theme flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-background p-8 text-center">
      <FlaskConical className="size-8 text-muted-foreground" />
      <h1 className="text-2xl font-semibold tracking-tight">Lab not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The lab you are looking for does not exist or is not published.
      </p>
      <Button render={<Link href="/dashboard/labs" />}>Back to My Labs</Button>
    </div>
  )
}