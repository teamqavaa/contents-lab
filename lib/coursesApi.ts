// lib/coursesApi.ts — URL de l'API des cours (courses-api, service Cloud Run contents-lab-api)
export const COURSES_API_URL = (
  process.env.COURSES_API_URL ||
  process.env.NEXT_PUBLIC_CART_API_URL ||
  "https://contents-lab-api-5jbnazjbya-ew.a.run.app"
).replace(/\/$/, "");
