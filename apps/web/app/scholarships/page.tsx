"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { fetchFeed } from "@/lib/api";
import type { FeedItem } from "@/lib/types";

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    async function load() {
      const { items, live: isLive } = await fetchFeed(undefined, "scholarship");
      setScholarships(items.filter((i) => i.category === "scholarship"));
      setLive(isLive);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell>
      <TopBar title="Scholarships & Grants" live={live} />
      <PageIntro
        title="Global Academic Scholarships"
        description="Discover fully funded master's, PhD, and undergraduate scholarships verified against official university registers."
      />
      <section className="feed-list">
        {loading && <p>Loading scholarships...</p>}
        {!loading && scholarships.map((item) => <FeedCard key={item.external_id} item={item} />)}
        {!loading && scholarships.length === 0 && <p className="empty-state">No scholarships currently available.</p>}
      </section>
    </AppShell>
  );
}
