// Résumé d'un cours présenté comme « career track » (préparé côté serveur, sans le détail des leçons)
export interface TrackSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  modules: number;
  lessons: number;
  minutes: number;
}
