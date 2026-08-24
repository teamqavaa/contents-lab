"use client";

import { MouseEvent } from "react";

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
  // Generer 32 octets aleatoires
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const verifier = base64UrlEncode(array.buffer);

  // Hacher en SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  const challenge = base64UrlEncode(hash);

  return { verifier, challenge };
}

export default function SignUpButton() {
  const SSO_PORTAL_URL = process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3000";
  const CLIENT_ID = process.env.NEXT_PUBLIC_SSO_CLIENT_ID || "UCUWyF4S2sglNWTbrz2Qu07DrEnE1lDZpDPuucPy";
  const REDIRECT_URI = "http://localhost:3001/auth/callback";

  const handleSignUp = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // 1. State CSRF
    const stateArray = new Uint8Array(16);
    window.crypto.getRandomValues(stateArray);
    const state = Array.from(stateArray, (b) => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem("sso_state", state);

    // 2. PKCE
    const { verifier, challenge } = await generatePKCE();
    localStorage.setItem("sso_code_verifier", verifier);

    // 3. Construction URL
    const ssoSignUpUrl = new URL(SSO_PORTAL_URL);
    ssoSignUpUrl.searchParams.set("client_id", CLIENT_ID);
    ssoSignUpUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    ssoSignUpUrl.searchParams.set("response_type", "code");
    ssoSignUpUrl.searchParams.set("mode", "register");
    ssoSignUpUrl.searchParams.set("state", state);
    ssoSignUpUrl.searchParams.set("code_challenge", challenge);
    ssoSignUpUrl.searchParams.set("code_challenge_method", "S256");

    window.location.href = ssoSignUpUrl.toString();
  };

  return (
    <a
      href="#"
      onClick={handleSignUp}
      className="group flex items-center gap-3 bg-blue-400 text-white pl-5 pr-1 py-1 rounded-full font-bold text-xs tracking-wider transition-all hover:bg-neutral-800"
    >
      <span>SIGN UP</span>
      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-black transition-transform group-hover:translate-x-0.5">
        <svg className="w-4 h-4 stroke-current stroke-[2]" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </a>
  );
}
