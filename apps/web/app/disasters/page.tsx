"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { fetchFeed } from "@/lib/api";
import type { FeedItem } from "@/lib/types";

export default function DisastersPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchFeed().then(({items}) => { setItems(items.filter(i => ["disaster","weather","safety"].includes(i.category))); setLoading(false); }); }, []);
  return <AppShell><TopBar title="DisasterLink"/><PageIntro title="Risk and safety updates" description="Urgent alerts are sorted by severity and recency. Always verify critical instructions with local authorities."/><section className="feed-list page-list">{loading ? <LoadingSkeleton/> : items.map(item => <FeedCard key={item.external_id} item={item}/>)}</section></AppShell>;
}
