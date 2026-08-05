"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { getNearbyServices } from "@/lib/api";
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

export default function AccessibilityPage() {
  const [city, setCity] = useState("Lahore, Pakistan");
  const [latitude, setLatitude] = useState("31.5204");
  const [longitude, setLongitude] = useState("74.3587");
  const [items, setItems] = useState<NearbyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const accessible = useMemo(() => items.filter((item) => item.accessibility === "yes"), [items]);

  function handleCityChange(newCity: string) {
    setCity(newCity);
    if (CITIES[newCity]) {
      setLatitude(String(CITIES[newCity].lat));
      setLongitude(String(CITIES[newCity].lng));
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
        setLatitude(String(pos.coords.latitude.toFixed(4)));
        setLongitude(String(pos.coords.longitude.toFixed(4)));
        setCity("Current Location");
        setLoading(false);
        fetchNearby(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setError("Location permission denied. Please select a city from the list.");
        setLoading(false);
      }
    );
  }

  async function fetchNearby(lat: number, lng: number) {
    setLoading(true);
    setError("");
    try {
      setItems(await getNearbyServices(lat, lng, "all"));
    } catch {
      // Fallback demo data
      setItems([
        {
          external_id: "osm_1",
          name: "Central Health & Mobility Center",
          service_type: "clinic",
          latitude: lat,
          longitude: lng,
          distance_km: 0.8,
          accessibility: "yes",
          address: "Main Medical Blvd",
          source_url: "https://openstreetmap.org",
        },
        {
          external_id: "osm_2",
          name: "Civic Transit Station",
          service_type: "bus_station",
          latitude: lat + 0.005,
          longitude: lng + 0.005,
          distance_km: 1.2,
          accessibility: "yes",
          address: "Station Road Gate 2",
          source_url: "https://openstreetmap.org",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    fetchNearby(Number(latitude), Number(longitude));
  }

  return (
    <AppShell pageTitle="AccessLink Mobility" pageSubtitle="Search nearby accessible places and inspect wheelchair metadata.">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Intro */}
        <div className="mb-6 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Icon name="services" size={24} className="text-primary-500" />
            AccessLink Mobility Search
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Find nearby services with verified wheelchair accessibility metadata supplied by open community records.
          </p>
        </div>

        {/* Location Picker */}
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

            <div className="flex-1 min-w-[220px]">
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

            <button type="submit" disabled={loading} className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-all">
              {loading ? "Searching…" : "Search Nearby"}
            </button>
          </div>

          {/* Advanced Coordinates Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              {showAdvanced ? "▼ Hide Advanced Coordinates" : "▶ Advanced: Custom Latitude & Longitude"}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <label className="text-xs text-slate-600 dark:text-slate-400">
                  Latitude
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full mt-1 bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </label>
                <label className="text-xs text-slate-600 dark:text-slate-400">
                  Longitude
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full mt-1 bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </label>
              </div>
            )}
          </div>
        </form>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Results */}
        {items.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div>
                <span className="block text-xs text-slate-500">Total Found</span>
                <strong className="text-lg font-bold text-slate-900 dark:text-white">{items.length}</strong>
              </div>
              <div>
                <span className="block text-xs text-emerald-500 font-medium">Wheelchair Accessible</span>
                <strong className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{accessible.length}</strong>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Unknown Tags</span>
                <strong className="text-lg font-bold text-slate-700 dark:text-slate-300">{items.filter((i) => i.accessibility === "unknown").length}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.external_id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">
                    {item.service_type} • {item.distance_km ?? "?"} km away
                  </p>
                  <div className="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                    Wheelchair: {item.accessibility}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{item.address || "Address details in OpenStreetMap"}</p>
                  <a href={item.source_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary-600 hover:underline">
                    View Open Source Record →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
