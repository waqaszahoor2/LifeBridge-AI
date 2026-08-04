"use client";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { getNearbyServices } from "@/lib/api";
import type { NearbyService } from "@/lib/types";

export default function ServicesPage() {
  const [lat,setLat]=useState("31.5204"),[lon,setLon]=useState("74.3587"),[type,setType]=useState("all"); const [items,setItems]=useState<NearbyService[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");try{setItems(await getNearbyServices(Number(lat),Number(lon),type));}catch{setError("Unable to query OpenStreetMap/Overpass. Try again later or use demo data.");}finally{setLoading(false)}}
  return <AppShell><TopBar title="ServiceLink"/><PageIntro title="Find nearby essential services" description="Search OpenStreetMap for hospitals, clinics, shelters and community facilities."/><form className="inline-form" onSubmit={submit}><label>Latitude<input type="number" step="any" value={lat} onChange={e=>setLat(e.target.value)}/></label><label>Longitude<input type="number" step="any" value={lon} onChange={e=>setLon(e.target.value)}/></label><label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All</option><option value="hospital">Hospital</option><option value="clinic">Clinic</option><option value="shelter">Shelter</option><option value="training">Training</option></select></label><button className="primary">{loading?"Searching…":"Find services"}</button></form>{error&&<p className="form-error">{error}</p>}<div className="service-grid">{items.map(item=><article className="service-card" key={item.external_id}><h2>{item.name}</h2><p>{item.service_type} · {item.distance_km ?? "?"} km</p><p>Wheelchair: {item.accessibility}</p><p>{item.address||"Address unavailable"}</p><a href={item.source_url} target="_blank" rel="noreferrer">Open source map</a></article>)}</div></AppShell>;
}
