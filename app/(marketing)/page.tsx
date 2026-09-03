// app/page.tsx (App A)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomePage from "@/components/Home";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectTo = resolvedSearchParams.redirect;

  // Récupération des cookies côté serveur
  const cookieStore = await cookies();
  const token = cookieStore.get("app_a_token")?.value;

  // Si l'utilisateur est connecté ET qu'un paramètre redirect est présent
  if (token && redirectTo) {
    const destination = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo;
    redirect(destination);
  }

  // Sinon, on affiche la page d'accueil normale
  return (
    <>
      <HomePage />
    </>
  );
}
