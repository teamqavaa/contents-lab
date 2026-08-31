// components/Navbar.tsx

import { cookies } from "next/headers";
import { fetchMe } from "@/lib/admin-auth";
import Header from "./header/laptop/Header";
import { logoutAction } from "@/lib/admin-actions";
import MobileHeaderBar from "./header/mobile/MobileHeaderBar";

export default async function Navbar() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const session = token ? await fetchMe(token) : null;

  return (
    <>
      {/* Visible uniquement sur tablette / ordinateur */}
      <div className="hidden md:block">
        <Header
          user={session ? { name: session.display_name || session.full_name || session.email || undefined, email: session.email || undefined } : null}
          onSignOut={logoutAction}
        />
      </div>

      {/* Visible uniquement sur mobile */}
      <MobileHeaderBar />
    </>
  );
}
