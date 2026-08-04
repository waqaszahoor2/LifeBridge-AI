"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { fetchFeed } from "@/lib/api";
import type { FeedItem } from "@/lib/types";

export default function OpportunitiesPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchFeed().then(({items}) => { setItems(items.filter((i: FeedItem) => ["job","scholarship","learning"].includes(i.category))); setLoading(false); }); }, []);
  return <AppShell><TopBar title="Opportunities"/><PageIntro title="Jobs, scholarships and learning" description="Verified and demo opportunities with publication, deadline and last-checked timestamps."/><section className="feed-list page-list">{loading ? <LoadingSkeleton/> : items.map(item => <FeedCard key={item.external_id} item={item}/>)}</section></AppShell>;
}
