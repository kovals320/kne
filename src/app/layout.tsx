import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { InstallPrompt } from "@/core/ui/InstallPrompt";
import "./globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "ניר אליהו", template: "%s – ניר אליהו" },
  description: "האפליקציה של קיבוץ ניר אליהו",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "ניר אליהו", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f6f4ee",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body className="min-h-dvh text-ink antialiased">
        {children}
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
