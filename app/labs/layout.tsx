import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function LabsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} lab-page flex h-dvh w-full flex-col overflow-hidden`}
      style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
    >
      {children}
    </div>
  )
}
