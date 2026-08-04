"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { fetchFeed } from "@/lib/api";
import type { FeedItem } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    async function load() {
      const { items, live: isLive } = await fetchFeed(undefined, "job");
      setJobs(items.filter((i) => i.category === "job"));
      setLive(isLive);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell>
      <TopBar title="Jobs & Careers" live={live} />
      <PageIntro
        title="Verified Job Opportunities"
        description="Explore remote and regional career opportunities extracted from official job boards and verified feeds."
      />
      <section className="feed-list">
        {loading && <p>Loading job postings...</p>}
        {!loading && jobs.map((item) => <FeedCard key={item.external_id} item={item} />)}
        {!loading && jobs.length === 0 && <p className="empty-state">No job postings currently available.</p>}
      </section>
    </AppShell>
  );
}
