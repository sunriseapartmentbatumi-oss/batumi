"use server";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/admin/logic";
import { sessionClient } from "@/lib/admin/session";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/login?msg=invalid");
  const db = await sessionClient();
  if (!db) redirect("/admin/login?msg=config");
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error) redirect("/admin/login?msg=invalid");
  const { data: isAdmin } = await db.rpc("is_admin");
  if (isAdmin !== true) {
    await db.auth.signOut();
    redirect("/admin/login?msg=denied");
  }
  redirect("/admin");
}

export async function logout() {
  const db = await sessionClient();
  await db?.auth.signOut();
  redirect("/admin/login");
}
