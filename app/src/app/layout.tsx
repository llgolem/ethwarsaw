import type { Metadata } from "next"
import "@/styles/globals.css"
import { Toaster } from "@/components/ui/sonner"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "_Wallm",
  description:
    "An LLM-powered chat to simplify your wallet interactions with a unique credit system.",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}

export default RootLayout
