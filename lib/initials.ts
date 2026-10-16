/** Initiales d'un utilisateur ("Jason Ranti" -> "JR"), à défaut la première lettre de l'email. */
export function getInitials(name?: string | null, email?: string | null): string {
  const words = (name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (email || "?").charAt(0).toUpperCase();
}

/** Prénom pour les salutations ("Jason Ranti" -> "Jason"). */
export function getFirstName(name?: string | null, email?: string | null): string {
  const first = (name || "").trim().split(/\s+/)[0];
  return first || (email || "").split("@")[0] || "";
}
