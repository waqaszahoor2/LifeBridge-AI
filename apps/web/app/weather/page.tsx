"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { fetchFeed } from "@/lib/api";
import type { FeedItem } from "@/lib/types";

export default function WeatherPage() {
  const [weatherItems, setWeatherItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    async function load() {
      const { items, live: isLive } = await fetchFeed(undefined, "weather");
      setWeatherItems(items.filter((i: FeedItem) => i.category === "weather"));
      setLive(isLive);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell>
      <TopBar title="Weather & Climate Warnings" live={live} />
      <PageIntro
        title="Severe Weather & Health Advisories"
        description="Real-time heatwave, rain, and air quality advisories gathered from meteorological departments and Open-Meteo."
      />
      <section className="feed-list">
        {loading && <p>Loading weather updates...</p>}
        {!loading && weatherItems.map((item) => <FeedCard key={item.external_id} item={item} />)}
        {!loading && weatherItems.length === 0 && <p className="empty-state">No weather alerts active.</p>}
      </section>
    </AppShell>
  );
}
