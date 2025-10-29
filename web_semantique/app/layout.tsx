import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "EatWise",
  description: "EatWise — assistant de nutrition",
  generator: "EatWise",
  icons: {
    icon: "/eatwise-apple.svg",
    shortcut: "/placeholder-logo.png",
    apple: "/eatwise-apple.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/eatwise-apple.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/placeholder-logo.png" />
        <meta name="theme-color" content="#f6f6f6ff" />
      </head>
      <body>
        <header className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white shadow-sm">
          <img
            src="/eatwise-apple.svg"
            alt="EatWise logo"
            className="h-12 w-12 bg-white rounded-full p-1 object-contain shadow"
          />
          <span className="text-xl font-semibold text-white">EatWise</span>
        </header>

        <main className="min-h-[calc(100vh-64px)]">{children}</main>

        <Analytics />
      </body>
    </html>
  )
}
