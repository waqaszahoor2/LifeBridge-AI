import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeBridge AI",
  description: "Opportunities, safety, accessibility and trusted updates in one intelligent feed."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
