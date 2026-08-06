"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { getNearbyServices, isDemoModeEnabled } from "@/lib/api";
import type { NearbyService } from "@/lib/types";

const CITIES: Record<string, { lat: number; lng: number }> = {
  "Lahore, Pakistan": { lat: 31.5204, lng: 74.3587 },
  "Karachi, Pakistan": { lat: 24.8607, lng: 67.0011 },
  "Islamabad, Pakistan": { lat: 33.6844, lng: 73.0479 },
  "Delhi, India": { lat: 28.6139, lng: 77.2090 },
  "Mumbai, India": { lat: 19.0760, lng: 72.8777 },
  "London, UK": { lat: 51.5074, lng: -0.1278 },
  "New York, USA": { lat: 40.7128, lng: -74.0060 },
};

export default function ServicesPage() {
  const [city, setCity] = useState("Lahore, Pakistan");
  const [lat, setLat] = useState("31.5204");
  const [lon, setLon] = useState("74.3587");
  const [type, setType] = useState("all");
  const [items, setItems] = useState<NearbyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isDemo = isDemoModeEnabled();

  function handleCityChange(newCity: string) {
    setCity(newCity);
    if (CITIES[newCity]) {
      setLat(String(CITIES[newCity].lat));
      setLon(String(CITIES[newCity].lng));
    }
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(4)));
        setLon(String(pos.coords.longitude.toFixed(4)));
        setCity("Current Location");
        setLoading(false);
        fetchNearby(pos.coords.latitude, pos.coords.longitude, type);
      },
      () => {
        setError("Location permission denied. Please select a city from the list.");
        setLoading(false);
      }
    );
  }

  async function fetchNearby(latitude: number, longitude: number, serviceType: string) {
    setLoading(true);
    setError("");
    try {
      setItems(await getNearbyServices(latitude, longitude, serviceType));
    } catch {
      if (isDemoModeEnabled()) {
        setItems([
          {
            external_id: "srv_demo_1",
            name: "Demonstration Hospital",
            service_type: "hospital",
            latitude: latitude,
            longitude: longitude,
            distance_km: 1.1,
            accessibility: "yes",
            address: "Demo Location Ward, Block A",
            source_url: "#",
          },
          {
            external_id: "srv_demo_2",
            name: "Demonstration Community Clinic",
            service_type: "clinic",
            latitude: latitude + 0.008,
            longitude: longitude + 0.008,
            distance_km: 2.3,
            accessibility: "yes",
            address: "Demo Community Complex",
            source_url: "#",
          },
        ]);
      } else {
        setError("We could not load live nearby services.");
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    fetchNearby(Number(lat), Number(lon), type);
  }

  return (
    <AppShell pageTitle="Essential Services" pageSubtitle="Find verified emergency wards, community health clinics, and essential care facilities.">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Intro */}
        <div className="mb-6 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Icon name="services" size={24} className="text-primary-500" />
            Essential Service Finder
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Search nearby hospitals, emergency clinics, and community support centers with clear location data.
          </p>
        </div>

        {/* Search Controls */}
        <form onSubmit={submit} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all flex items-center gap-2"
            >
              <Icon name="target" size={16} />
              <span>Use My Location</span>
            </button>

            <div className="flex-1 min-w-[200px]">
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                {Object.keys(CITIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {city === "Current Location" && <option value="Current Location">Current Location</option>}
              </select>
            </div>

            <div className="w-40">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="all">All Service Types</option>
                <option value="hospital">Hospitals</option>
                <option value="clinic">Clinics</option>
                <option value="pharmacy">Pharmacies</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-all">
              {loading ? "Searching…" : "Search Services"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-3">
            <div className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</div>
            <button
              type="button"
              onClick={() => fetchNearby(Number(lat), Number(lon), type)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 text-white shadow hover:bg-primary-700 transition-all"
            >
              Retry Search
            </button>
          </div>
        )}

        {/* Results */}
        {items.length > 0 && (
          <div className="space-y-4">
            {isDemo && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 font-medium">
                Demonstration result — live location data is unavailable.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.external_id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {item.service_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Distance: {item.distance_km ?? "?"} km</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.address || "Address details unavailable"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
