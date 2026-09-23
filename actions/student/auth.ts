"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SSO_API_URL,
  SSO_ADMIN_ORIGIN,
  SSO_PUBLIC_HOME_ORIGIN,
  safeReturnPath,
} from "@/lib/student/sso";

export async function loginAction(formData: FormData, next?: string) {
  // 1. On récupère la valeur du champ "identifier" de votre formulaire Next.js
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Fields are required." };
  }

  // 2. On aligne le payload sur ce que votre CustomTokenObtainPairSerializer attend :
  // Il lui faut une clé 'username' (qui recevra l'email ou le téléphone) et 'password'
  const payload = {
    username: identifier,
    password: password,
  };

  // redirect() always throws a NEXT_REDIRECT error. Keep it OUT of the network
  // try/catch below, whose catch would otherwise turn a successful login into
  // a misleading "unable to connect" message. Compute the destination inside
  // the try, then redirect after it.
  let redirectUrl: string | null = null;

  try {
    const response = await fetch(`${SSO_API_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("🔴 Erreur Django REST :", response.status, errorData);

      // Si Django renvoie une erreur de validation (ex: "Aucun compte trouvé"),
      // on affiche le message précis renvoyé par le serializer
      return { error: errorData.detail || "Invalid credentials." };
    }

    const data = await response.json();
    const cookieStore = await cookies();

    // Resolve the role server-side so the action can route staff to the
    // central admin and students to their dashboard. The SSO profile carries
    // both the is_staff flag and the role list; accept either.
    let isStaff = false;
    try {
      const meResponse = await fetch(`${SSO_API_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${data.access}` },
        cache: "no-store",
      });
      if (meResponse.ok) {
        const profile = await meResponse.json();
        isStaff =
          Boolean(profile?.is_staff) ||
          Array.isArray(profile?.roles) &&
          profile.roles.includes("admin") ||
          profile.roles.includes("staff");
      }
    } catch {
      // Role lookup failure must not block login; the student dashboard is
      // the safe default and admin APIs still enforce staff server-side.
    }

    if (isStaff) {
      // Staff sessions belong to the central admin app (contents-lab), which
      // adopts the token through /auth/complete?token=. Do not store staff
      // tokens in the portal cookie; cookies ignore ports, so doing so would
      // overwrite a concurrently open student session on the same host.
      const resolved = safeReturnPath(next ?? null);
      const target = encodeURIComponent(resolved === "/home" ? "/admin" : resolved);
      redirectUrl = `${SSO_ADMIN_ORIGIN}/auth/complete?token=${encodeURIComponent(data.access)}&next=${target}`;
    } else {
      // 3. Stockage des jetons d'authentification cryptés
      cookieStore.set("access_token", data.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      });

      cookieStore.set("refresh_token", data.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      });

      // Students stay on the portal. Follow the deep-link path when one applies,
      // otherwise land on the student home page.
      redirectUrl = safeReturnPath(next ?? null);
    }
  } catch {
    return { error: "Unable to connect to the authentication server." };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

export async function registerAction(formData: FormData, next?: string) {
  // 1. Récupération des champs distincts du formulaire Next.js
  const emailInput = (formData.get("email") as string)?.trim() || null;
  const phoneInput = (formData.get("phone") as string)?.trim() || null;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  // Sécurité : l'utilisateur doit fournir au moins l'email OU le téléphone, et le reste des champs obligatoires
  if ((!emailInput && !phoneInput) || !password || !name) {
    return { error: "Le nom, le mot de passe et au moins un identifiant (Email ou Téléphone) sont requis." };
  }

  // 2. Construction du payload propre pour le UserSerializer de Django
  const payload = {
    name: name,
    password: password,
    email: emailInput,
    phone: phoneInput,
  };

  // redirect() throws NEXT_REDIRECT; keep it out of the network try/catch below.
  let redirectUrl: string | null = null;

  try {
    // 3. Envoi de la requête POST vers votre UserViewSet SSO
    const response = await fetch(`${SSO_API_URL}/api/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔴 Erreur d'inscription Django REST :", response.status, data);

      // Traduction des erreurs de validation uniques renvoyées par Django
      if (data.email) return { error: "Cet e-mail est déjà utilisé." };
      if (data.phone) return { error: "Ce numéro de téléphone est déjà utilisé." };
      return { error: data.detail || "Une erreur est survenue lors de l'inscription." };
    }

    // 4. ⚡ CONNEXION AUTOMATIQUE APRES INSCRIPTION REUSSIE
    const cookieStore = await cookies();

    // Enregistrement des cookies HttpOnly sécurisés reçus depuis le ViewSet
    cookieStore.set("access_token", data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    cookieStore.set("refresh_token", data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    // New accounts are never staff, so registration only ever returns a
    // student. Send the user on the deep-link path when one applies.
    redirectUrl = safeReturnPath(next ?? null);
  } catch (error) {
    console.error("🚨 Erreur réseau Server Action :", error);
    return { error: "Impossible de joindre le serveur d'authentification." };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

export async function getMeAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  // Si aucun token n'est trouvé, l'utilisateur n'est pas connecté
  if (!accessToken) {
    return { user: null, error: "Non authentifié" };
  }

  try {
    // Appel de l'action 'me' du UserProfileViewSet SSO. Returns the editable
    // profile fields (full_name, bio, birth_date, language, avatar) that the
    // frontend reads; /api/users/me/ only exposes login/identity fields.
    const response = await fetch(`${SSO_API_URL}/api/profile/me/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      // On désactive le cache pour toujours avoir les données à jour
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔴 Erreur /users/me/ Django :", data);
      return { user: null, error: "Impossible de récupérer le profil" };
    }

    return { user: data, error: null };

  } catch (error) {
    console.error("🚨 Erreur réseau getMeAction :", error);
    return { user: null, error: "Erreur réseau" };
  }
}

export async function clearAuthCookies() {
  // Next.js only allows cookie writes inside Server Actions or Route
  // Handlers; the dashboard layout calls this during render, so failures
  // must never crash the request.
  try {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("cl_admin_token");
  } catch {
    // Render-phase call: skip cleanup, the redirect below still runs.
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("cl_admin_token");
  // Sign out returns to the public marketing homepage, not the SSO login form.
  redirect(SSO_PUBLIC_HOME_ORIGIN);
}

export async function updateProfileAction(field: string, value: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { ok: false, message: "Not authenticated" };
  }

  try {
    const response = await fetch(`${SSO_API_URL}/api/profile/me/`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [field]: value }),
    });

    if (!response.ok) {
      return { ok: false, message: "Failed to update profile" };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "Network error" };
  }
}


