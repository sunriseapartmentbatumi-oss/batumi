import type { Metadata } from "next";
import Link from "next/link";
import { StatusForm } from "./form";

export const metadata: Metadata = { title: "Status rezerwacji", robots: { index: false } };

export default function StatusPage() {
  return (
    <main className="page">
      <h1>Status rezerwacji</h1>
      <p>Podaj numer rezerwacji i e-mail użyty w formularzu.</p>
      <StatusForm />
      <p><Link href="/rezerwacja">Wróć do rezerwacji</Link></p>
    </main>
  );
}
