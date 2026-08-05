"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function DataSourcesPage() {
  const sources = [
    {
      name: "NASA EONET (Earth Observatory Natural Event Tracker)",
      category: "Disaster & Earth Events",
      status: "Verified Live API",
      url: "https://eonet.gsfc.nasa.gov",
      description: "Real-time natural event data including wildfires, severe storms, volcanoes, and ice bergs.",
    },
    {
      name: "GDACS (Global Disaster Alert and Coordination System)",
      category: "Disaster & Emergency Warnings",
      status: "Verified Live Feed",
      url: "https://www.gdacs.org",
      description: "Joint framework of the United Nations and the European Commission providing real-time disaster alerts.",
    },
    {
      name: "Open-Meteo Weather API",
      category: "Weather & Forecast",
      status: "Verified Live API",
      url: "https://open-meteo.com",
      description: "High-resolution open-source weather forecasting and historical meteorological data.",
    },
    {
      name: "ReliefWeb API",
      category: "Humanitarian Services",
      status: "Verified API",
      url: "https://reliefweb.int",
      description: "Humanitarian information service provided by the United Nations Office for the Coordination of Humanitarian Affairs (OCHA).",
    },
    {
      name: "OpenStreetMap Nominatim",
      category: "Geocoding & Essential Services",
      status: "Verified Open Data",
      url: "https://openstreetmap.org",
      description: "Community-driven open geographic data for identifying nearby hospitals, shelters, and relief stations.",
    },
    {
      name: "Verified Opportunity RSS Feeds",
      category: "Scholarships & Jobs",
      status: "Verified Feed",
      url: "https://lifebridge.ai/data-sources",
      description: "Curated RSS feeds from global scholarship bodies, civic tech portals, and job platforms.",
    },
  ];

  return (
    <AppShell pageTitle="Data Sources & Integrity" pageSubtitle="Overview of official APIs, government feeds, and verification mechanisms power LifeBridge AI.">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Icon name="sparkles" size={22} className="text-primary-500" />
            Official Collectors & Data Providers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            LifeBridge AIaggregates information from international disaster coordination portals, satellite data, open-source weather models, and verified job boards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sources.map((src, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                  {src.category}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {src.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{src.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{src.description}</p>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline pt-1"
              >
                <span>Visit Official Source</span>
                <Icon name="external" size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
