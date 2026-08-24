'use server';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiTag {
  id: string;
  name: string;
  slug: string;
}

export interface CourseDetails {
  id: string;
  category_details: ApiCategory;
  tags_details: ApiTag[];
  instructor_id: string;
  instructor_name: string;
  instructor_role: string;
  instructor_company: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  language: string;
  level: string;
  price: number;
  discount_price: number;
  discount_percentage?: number;
  thumbnail: string;
  promo_video_url: string;
  average_rating: number;
  total_students: number;
  total_reviews: number;
  lessons_count: number;
  total_duration: string;
  who_this_is_for: string;
  learning_outcomes: string[];
  what_is_included: string[];
}

export async function getCourseDetails(slug: string): Promise<CourseDetails | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/courses/${slug}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Erreur HTTP! Statut: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Traitement des prix
    const price = parseFloat(data.price || '0');
    const discountPrice = parseFloat(data.discount_price || '0');
    const hasDiscount = discountPrice > 0 && discountPrice < price;

    const finalPrice = hasDiscount ? discountPrice : price;
    const originalPrice = hasDiscount ? price : undefined;

    const discountPercentage = originalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : undefined;

    return {
      id: data.id,
      category_details: data.category_details || { id: '', name: 'General', slug: '' },
      tags_details: data.tags_details || [],
      instructor_id: data.instructor_id,
      instructor_name: data.instructor_name || 'Amara Odili',
      instructor_role: data.instructor_role || 'Marketing Lead',
      instructor_company: data.instructor_company || 'Qavaa Lab',
      title: data.title || '',
      slug: data.slug || slug,
      subtitle: data.subtitle || '',
      description: data.description || '',
      language: data.language || 'French',
      level: data.level || 'Intermediate',
      price: finalPrice,
      discount_price: originalPrice || finalPrice,
      ...(discountPercentage !== undefined && { discount_percentage: discountPercentage }),
      thumbnail: data.thumbnail || '/career.jpg',
      promo_video_url: data.promo_video_url || '',
      average_rating: Number(data.average_rating) || 0,
      total_students: Number(data.total_students) || 0,
      total_reviews: Number(data.total_reviews) || 0,
      lessons_count: data.lessons_count || 24,
      total_duration: data.total_duration || '6h 40m',
      who_this_is_for:
        data.who_this_is_for ||
        'Product designers, marketers and front-end engineers who want a repeatable, defensible approach.',
      learning_outcomes: data.learning_outcomes || [
        'Choose and defend a modular scale',
        'Set vertical rhythm with baseline grids',
        'Build responsive clamp() tokens',
        'Pair design principles with intent',
      ],
      what_is_included: data.what_is_included || [
        '24 lessons · 6h 40m of video',
        '18 downloadable files & templates',
        'Private community access',
        'Lifetime access, all updates',
      ],
    };
  } catch (error) {
    console.error('Erreur getCourseDetails:', error);
    return null;
  }
}
