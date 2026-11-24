import { content, siteConfig } from "@/lib/site";

const isStaging = process.env.VERCEL_ENV !== "production";

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
    <main style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>{siteConfig.name}</h1>
      {isStaging && (
        <p>
          <strong>STAGING – wersja testowa</strong>
        </p>
      )}
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
    </main>
  );
}
