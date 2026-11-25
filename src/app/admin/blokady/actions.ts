"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { blockSchema, idSchema, toDateRange } from "@/lib/admin/logic";
import { recordEvent } from "@/lib/events";
import { logDbError } from "@/lib/diagnostics";
import { requireAdmin } from "@/lib/admin/session";

export async function addBlock(formData: FormData) {
  const { db, userId } = await requireAdmin();
  const parsed = blockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/blokady?msg=invalid");
  const { data: property } = await db.from("properties").select("id").order("created_at").limit(1).maybeSingle();
  if (!property) redirect("/admin/blokady?msg=noproperty");
  const { error } = await db.from("calendar_blocks").insert({
    property_id: property.id,
    blocked_during: toDateRange(parsed.data.from, parsed.data.to),
    reason: parsed.data.reason || null,
    created_by: userId,
  });
  if (error) {
    logDbError("admin.addBlock", error);
    await recordEvent("admin_action_error", "admin.addBlock", { code: error.code ?? null });
  }
  revalidatePath("/admin/blokady");
  redirect(`/admin/blokady?msg=${error ? "error" : "saved"}`);
}

export async function deleteBlock(formData: FormData) {
  const { db } = await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/blokady?msg=invalid");
  const { error } = await db.from("calendar_blocks").delete().eq("id", id.data);
  if (error) {
    logDbError("admin.deleteBlock", error);
    await recordEvent("admin_action_error", "admin.deleteBlock", { code: error.code ?? null });
  }
  revalidatePath("/admin/blokady");
  redirect(`/admin/blokady?msg=${error ? "error" : "saved"}`);
}
