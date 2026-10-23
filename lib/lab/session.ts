import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function requireLabSession(returnTo: string) {
  const token = (await cookies()).get("access_token")?.value
  if (!token) {
    redirect(`/api/auth/login?redirect=${encodeURIComponent(returnTo)}`)
  }
}
