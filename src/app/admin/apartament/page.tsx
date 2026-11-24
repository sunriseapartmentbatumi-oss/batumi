import { requireAdmin } from "@/lib/admin/session";
import { TBC } from "@/lib/site";
import { addAmenity, deleteAmenity, saveProperty } from "./actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  saved: "Zapisano.",
  invalid: "Niepoprawne dane.",
  error: "Błąd zapisu.",
  noproperty: "Najpierw zapisz dane apartamentu.",
};

export default async function PropertyPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  const { db } = await requireAdmin();
  const { data: property } = await db.from("properties").select("id,name").order("created_at").limit(1).maybeSingle();
  const { data: amenities } = await db.from("amenities").select("id,name").order("created_at");
  return (
    <main>
      <h1>Apartament</h1>
      {msg && messages[msg] && <p role="status">{messages[msg]}</p>}
      <form action={saveProperty} style={{ display: "grid", gap: "0.75rem" }}>
        <label>Nazwa <input name="name" required defaultValue={property?.name ?? TBC} /></label>
        <button type="submit">{property ? "Zapisz" : "Utwórz apartament"}</button>
      </form>
      <h2>Udogodnienia</h2>
      <ul>
        {(amenities ?? []).map((a) => (
          <li key={a.id}>
            {a.name}{" "}
            <form action={deleteAmenity} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={a.id} />
              <button type="submit">Usuń</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={addAmenity} style={{ display: "grid", gap: "0.75rem" }}>
        <label>Nowe udogodnienie <input name="name" required /></label>
        <button type="submit" disabled={!property}>Dodaj</button>
      </form>
    </main>
  );
}
