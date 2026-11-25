"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canTransition, idSchema, reservationStatusSchema, statusTimestampColumn } from "@/lib/admin/logic";
import { recordEvent } from "@/lib/events";
import { logDbError } from "@/lib/diagnostics";
import { requireAdmin } from "@/lib/admin/session";

export async function changeStatus(formData: FormData) {
  const { db } = await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  const to = reservationStatusSchema.safeParse(formData.get("to"));
  if (!id.success || !to.success) redirect("/admin/rezerwacje?msg=invalid");
  const { data: current } = await db.from("reservations").select("status").eq("id", id.data).maybeSingle();
  if (!current || !canTransition(current.status, to.data)) redirect("/admin/rezerwacje?msg=transition");
  const patch: Record<string, string | null> = { status: to.data };
  const col = statusTimestampColumn(to.data);
  if (col) patch[col] = new Date().toISOString();
  if (to.data !== "pending_payment") patch.hold_expires_at = null;
  const { error } = await db.from("reservations").update(patch).eq("id", id.data).eq("status", current.status);
  if (error) {
    logDbError("admin.changeStatus", error, { to: to.data });
    await recordEvent("admin_action_error", "admin.changeStatus", { code: error.code ?? null });
  }
  revalidatePath("/admin/rezerwacje");
  redirect(`/admin/rezerwacje?msg=${error ? "error" : "saved"}`);
}
