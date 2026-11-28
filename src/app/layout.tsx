import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { Bebas_Neue, JetBrains_Mono, Plus_Jakarta_Sans, Space_Grotesk, Vazirmatn } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { heroPortrait } from "@/data/portraits";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-space",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "900"],
  variable: "--font-vazir",
  display: "swap",
});

const description =
  "Bilingual portfolio of Saeed Mahjobi. Six active products, a 2020 archive, and five humanoid agent rigs.";

const portraitReady = existsSync(path.join(process.cwd(), "public/portrait/saeed.png"));

export const metadata: Metadata = {
  title: "Saeed Mahjobi — ONE COMMAND",
  description,
  openGraph: {
    title: "Saeed Mahjobi — ONE COMMAND",
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Saeed Mahjobi — ONE COMMAND",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${jakarta.variable} ${space.variable} ${jetbrains.variable} ${vazir.variable} ${bebas.variable}`}
    >
      <body className="antialiased" data-portrait={portraitReady ? "ready" : "empty"}>
        <link
          rel="preload"
          as="image"
          href={heroPortrait.src}
          type="image/webp"
          fetchPriority="high"
          media="(min-width: 640px)"
        />
        <link
          rel="preload"
          as="image"
          href={heroPortrait.mobileSrc}
          type="image/webp"
          fetchPriority="high"
          media="(max-width: 639px)"
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
