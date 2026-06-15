import localFont from "next/font/local";
import { Inter, Playfair_Display } from "next/font/google";

// Display — Clash Display (self-hosted from Fontshare)
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

// Body — Inter
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Editorial serif accents — Playfair Display
export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});
