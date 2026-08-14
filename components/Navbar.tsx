// components/Navbar.tsx

import Header from "./header/laptop/Header";
import MobileHeaderBar from "./header/mobile/MobileHeaderBar";


export default function Navbar() {
  return (
    <>
      {/* Visible uniquement sur tablette / ordinateur */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Visible uniquement sur mobile */}
      <MobileHeaderBar />
    </>
  );
}
