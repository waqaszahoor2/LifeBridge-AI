import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LifeBridge AI",
    template: "%s — LifeBridge AI",
  },
  description:
    "Opportunities, safety, accessibility and trusted updates in one intelligent feed.",
  metadataBase: new URL("https://life-bridge-ai-ten.vercel.app"),
  openGraph: {
    title: "LifeBridge AI",
    description:
      "Practical AI support for opportunities, skills, safety and everyday decisions.",
    type: "website",
    siteName: "LifeBridge AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="skip-to-content"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

