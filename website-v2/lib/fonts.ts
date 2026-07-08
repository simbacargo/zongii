import localFont from "next/font/local";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";

// Display — Clash Display (self-hosted from Fontshare): engineered, confident
export const clashDisplay = localFont({
  src: [
    { path: "../public/fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

// Body/UI — Hanken Grotesk: warm humanist grotesque
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Spec/stamp — IBM Plex Mono: part numbers, ratings, plate labels
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});
