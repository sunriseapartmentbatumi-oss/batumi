import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { db, email } = await requireAdmin();
  const { count } = await db.from("reservations").select("id", { count: "exact", head: true }).eq("status", "pending_payment");
  return (
    <main>
      <h1>Panel administracyjny</h1>
      <p>Zalogowano: {email}</p>
      <ul>
        <li><Link href="/admin/rezerwacje?status=pending_payment">Rezerwacje oczekujące: {count ?? 0}</Link></li>
        <li><Link href="/admin/blokady">Blokady terminów</Link></li>
        <li><Link href="/admin/apartament">Dane apartamentu i udogodnienia</Link></li>
      </ul>
    </main>
  );
}
