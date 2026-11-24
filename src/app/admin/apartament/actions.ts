"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { amenitySchema, idSchema, propertySchema } from "@/lib/admin/logic";
import { requireAdmin } from "@/lib/admin/session";

const back = (msg: string) => redirect(`/admin/apartament?msg=${msg}`);

export async function saveProperty(formData: FormData) {
  const { db } = await requireAdmin();
  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) back("invalid");
  const { data: existing } = await db.from("properties").select("id").order("created_at").limit(1).maybeSingle();
  const res = existing
    ? await db.from("properties").update({ name: parsed.data!.name }).eq("id", existing.id)
    : await db.from("properties").insert({ name: parsed.data!.name });
  revalidatePath("/admin/apartament");
  back(res.error ? "error" : "saved");
}

export async function addAmenity(formData: FormData) {
  const { db } = await requireAdmin();
  const parsed = amenitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) back("invalid");
  const { data: property } = await db.from("properties").select("id").order("created_at").limit(1).maybeSingle();
  if (!property) back("noproperty");
  const res = await db.from("amenities").insert({ property_id: property!.id, name: parsed.data!.name });
  revalidatePath("/admin/apartament");
  back(res.error ? "error" : "saved");
}

export async function deleteAmenity(formData: FormData) {
  const { db } = await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) back("invalid");
  const res = await db.from("amenities").delete().eq("id", id.data!);
  revalidatePath("/admin/apartament");
  back(res.error ? "error" : "saved");
}
