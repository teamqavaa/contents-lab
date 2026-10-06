const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://contents-lab-api-5jbnazjbya-ew.a.run.app';

export async function getCourseBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/courses/${slug}/`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Erreur lors de la récupération du cours :", error);
    return null;
  }
}
