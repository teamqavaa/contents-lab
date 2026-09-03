// Base URL of the Digital Readiness Lab (DRL) service: the labs, skills and
// objectives admin API. This is a separate Django backend from courses-api.
const LABS_API_URL = process.env.LABS_API_URL ?? "http://localhost:8002";

export { LABS_API_URL };
