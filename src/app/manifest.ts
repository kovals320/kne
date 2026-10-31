import type { MetadataRoute } from "next";

// Installable as one app on phones.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ניר אליהו",
    short_name: "ניר אליהו",
    description: "האפליקציה של קיבוץ ניר אליהו",
    lang: "he",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f4ee",
    theme_color: "#f6f4ee",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
