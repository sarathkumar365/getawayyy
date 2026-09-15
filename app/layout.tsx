import type { Metadata, Viewport } from "next";
import "@/styles/tokens.css";
import "@/styles/devnav.css";
import { DevNav } from "@/components/DevNav";

export const metadata: Metadata = {
  title: "Five directions, one October",
  description: "Weekend getaways from Toronto — pick one.",
  robots: { index: false, follow: false }, // private link; not for search
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // iPad-first: let her pinch if she wants a closer look at a photo.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#14120F" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DevNav />
        {children}
      </body>
    </html>
  );
}
