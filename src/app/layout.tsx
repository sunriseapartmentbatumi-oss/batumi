import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const isProd = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: "Apartament do wynajmu w Batumi – informacje i rezerwacja terminu.",
  robots: isProd ? { index: true, follow: true } : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={siteConfig.locale}>
      <body>
        {!isProd && <div className="banner">STAGING – wersja testowa</div>}
        <nav>
          <Link href="/">Strona główna</Link>
          <Link href="/rezerwacja">Rezerwacja</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
