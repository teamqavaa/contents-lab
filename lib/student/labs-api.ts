// The Digital Readiness Lab (DRL) backend serves the labs and progress
// endpoints. It runs separately from the courses-api catalog on port 8002.
const LABS_API_URL = process.env.LABS_API_URL ?? "http://localhost:8002";

export { LABS_API_URL };
