import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

// Klient z sesją użytkownika (klucz anon) – zapisy przechodzą przez RLS (is_admin()), service_role nie jest używany.
export async function sessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // wywołanie z Server Component – odświeżanie sesji robi middleware
        }
      },
    },
  });
}

export async function requireAdmin() {
  const db = await sessionClient();
  if (!db) redirect("/admin/login?msg=config");
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: isAdmin } = await db.rpc("is_admin");
  if (isAdmin !== true) {
    await db.auth.signOut();
    redirect("/admin/login?msg=denied");
  }
  return { db, userId: data.user.id, email: data.user.email ?? "" };
}
