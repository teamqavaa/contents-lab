// Identity provider. The access_token cookie is issued by the SSO and the
// admin profile (roles, is_staff) lives there too, not on courses-api.
const SSO_API_URL = process.env.SSO_API_URL ?? "http://localhost:8001";

export { SSO_API_URL };