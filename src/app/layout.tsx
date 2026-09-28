import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans, Cormorant_Garamond, Bebas_Neue, Space_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL, jsonLd } from "@/lib/seo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  preload: false,
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  preload: false,
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Cavalheiro | Moda masculina e jeanswear", template: "%s | Cavalheiro" },
  description: "Conheça a Cavalheiro Jeanswear e explore nossa coleção de moda masculina no varejo e atacado.",
  verification: { google: "z-PGnueyREWnNHL4U-zTNyRiML9M6EExHo3SzqePI8I" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${dmSans.variable} ${cormorant.variable} ${bebasNeue.variable} ${spaceMono.variable} antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Cavalheiro", url: SITE_URL, telephone: "+55-81-99339-3065", email: "cavalheirodirecao@gmail.com", sameAs: ["https://www.instagram.com/cavalheiro.oficial/"] }) }} />
        {children}
      </body>
    </html>
  );
}
