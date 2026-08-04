"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { getNearbyServices } from "@/lib/api";
import type { NearbyService } from "@/lib/types";

export default function AccessibilityPage() {
  const [latitude, setLatitude] = useState("31.5204");
  const [longitude, setLongitude] = useState("74.3587");
  const [items, setItems] = useState<NearbyService[]>([]);
  const [error, setError] = useState("");
  const accessible = useMemo(() => items.filter((item) => item.accessibility === "yes"), [items]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      setItems(await getNearbyServices(Number(latitude), Number(longitude), "all"));
    } catch {
      setError("Accessibility data is unavailable. Public OpenStreetMap coverage and Overpass availability vary.");
    }
  }

  return (
    <AppShell>
      <TopBar title="AccessLink" />
      <PageIntro
        title="Accessibility-aware nearby places"
        description="Search nearby services and inspect the wheelchair metadata supplied by OpenStreetMap contributors. Unknown does not mean inaccessible; it means the source lacks a clear tag."
      />
      <form className="inline-form" onSubmit={submit}>
        <label>Latitude<input type="number" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} /></label>
        <label>Longitude<input type="number" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} /></label>
        <button className="primary">Check accessibility</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      {items.length > 0 && (
        <>
          <div className="stats access-stats">
            <div><span>Total returned</span><strong>{items.length}</strong></div>
            <div><span>Wheelchair yes</span><strong>{accessible.length}</strong></div>
            <div><span>Unknown tags</span><strong>{items.filter((item) => item.accessibility === "unknown").length}</strong></div>
          </div>
          <div className="service-grid">
            {items.map((item) => (
              <article className="service-card" key={item.external_id}>
                <h2>{item.name}</h2>
                <p>{item.service_type} · {item.distance_km ?? "?"} km</p>
                <p><strong>Wheelchair:</strong> {item.accessibility}</p>
                <p>{item.address || "Address not supplied"}</p>
                <a href={item.source_url} target="_blank" rel="noreferrer">Open source record</a>
              </article>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
