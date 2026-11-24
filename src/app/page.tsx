import Link from "next/link";
import { content, siteConfig } from "@/lib/site";

function Details({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <ul>
      {items.map((d) => (
        <li key={d.label}>
          {d.label}: {d.value}
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  const { about, location, amenities, contact } = content;
  return (
    <main className="page">
      <h1>{siteConfig.name}</h1>
      <section>
        <h2>{about.title}</h2>
        <p>{about.text}</p>
        <Details items={about.details} />
      </section>
      <section>
        <h2>{location.title}</h2>
        <p>{location.text}</p>
        <Details items={location.details} />
      </section>
      <section>
        <h2>{amenities.title}</h2>
        <p>{amenities.text}</p>
        <ul>
          {amenities.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>{contact.title}</h2>
        <p>{contact.text}</p>
        <Details items={contact.details} />
      </section>
      <p><Link href="/rezerwacja">Zarezerwuj termin</Link></p>
    </main>
  );
}
