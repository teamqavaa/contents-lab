"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const stateFromUrl = searchParams.get("state");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (code && !hasFetched.current) {
      hasFetched.current = true;

      // 1. Anti-CSRF Validation
      const savedState = sessionStorage.getItem("sso_state");
      if (stateFromUrl && savedState && stateFromUrl !== savedState) {
        console.error("🚨 CSRF validation failed: 'state' parameter mismatch!");
        sessionStorage.removeItem("sso_state");
        return;
      }
      sessionStorage.removeItem("sso_state");

      // 2. Client Credentials
      const clientId = "UCUWyF4S2sglNWTbrz2Qu07DrEnE1lDZpDPuucPy";
      const clientSecret = "EEglFtVDoVVOWJizri49HQ3RynfDiMzvEVEvN26yceEytFZ7TB9XQkP41GauTzxUESo5u8R0kWmSdlNlxnEoDxFARveSdnNiu78nl5uhU6Qy0CCueXjBNswAWSz2uNvG";

      // 3. Retrieve PKCE Code Verifier
      const codeVerifier = localStorage.getItem("sso_code_verifier") || "";

      const headers: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
      };

      if (clientSecret) {
        const credentials = btoa(`${clientId}:${clientSecret}`);
        headers["Authorization"] = `Basic ${credentials}`;
      }

      const bodyData = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3001/auth/callback",
        client_id: clientId,
        code_verifier: codeVerifier,
      });

      // 4. Token Exchange Request
      fetch("http://localhost:8000/o/token/", {
        method: "POST",
        headers: headers,
        body: bodyData,
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("Django OAuth2 rejection details:", data);
            throw new Error(`HTTP Error ${res.status}: ${data.error_description || data.error || "Unauthorized"}`);
          }
          return data;
        })
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("app_a_token", data.access_token);
            localStorage.removeItem("sso_code_verifier");

            // Déclenche l'événement personnalisé pour mettre à jour le Header immédiatement
            window.dispatchEvent(new Event("authChange"));

            router.push("/");
            router.refresh();
          }
        })
        .catch((err) => {
          console.error("Error during SSO code exchange:", err);
        });
    }
  }, [code, stateFromUrl, router]);

  return <p className="p-8 text-center font-medium text-slate-600">Authenticating via SSO...</p>;
}
