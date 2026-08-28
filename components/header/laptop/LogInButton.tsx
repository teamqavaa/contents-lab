"use client";

import { MouseEvent } from "react";

// Same PKCE handshake as SignUpButton, but without `mode=register` so the SSO
// portal shows the login form. The qi-sso-front callback completes the flow.
export default function LogInButton() {
  const SSO_PORTAL_URL = process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001";
  const CLIENT_ID = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "UCUWyF4S2sglNWTbrz2Qu07DrEnE1lDZpDPuucPy";
  const REDIRECT_URI = "http://localhost:3001/auth/callback";

  function base64UrlEncode(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function generatePKCE() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const verifier = base64UrlEncode(array.buffer);
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return { verifier, challenge: base64UrlEncode(hash) };
  }

  const handleLogin = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const stateArray = new Uint8Array(16);
    window.crypto.getRandomValues(stateArray);
    const state = Array.from(stateArray, (b) => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem("sso_state", state);

    const { verifier, challenge } = await generatePKCE();
    localStorage.setItem("sso_code_verifier", verifier);

    const ssoLoginUrl = new URL(SSO_PORTAL_URL);
    ssoLoginUrl.searchParams.set("client_id", CLIENT_ID);
    ssoLoginUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    ssoLoginUrl.searchParams.set("response_type", "code");
    ssoLoginUrl.searchParams.set("state", state);
    ssoLoginUrl.searchParams.set("code_challenge", challenge);
    ssoLoginUrl.searchParams.set("code_challenge_method", "S256");

    window.location.href = ssoLoginUrl.toString();
  };

  return (
    <a
      href="#"
      onClick={handleLogin}
      className="text-xs font-bold tracking-wider text-black hover:text-blue-400 transition-colors uppercase"
    >
      Log In
    </a>
  );
}