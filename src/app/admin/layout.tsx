import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "./login/actions";

export const metadata: Metadata = { title: "Panel administracyjny", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page">
      <nav>
        <Link href="/admin">Panel</Link>
        <Link href="/admin/rezerwacje">Rezerwacje</Link>
        <Link href="/admin/blokady">Blokady</Link>
        <Link href="/admin/apartament">Apartament</Link>
        <form action={logout}><button type="submit">Wyloguj</button></form>
      </nav>
      {children}
    </div>
  );
}
