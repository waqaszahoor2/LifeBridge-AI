import type { FeedItem } from "@/lib/types";

export function StatsGrid({ feed }: { feed: FeedItem[] }) {
  const counts = {
    urgent: feed.filter((item) => ["critical", "high"].includes(item.severity)).length,
    jobs: feed.filter((item) => item.category === "job").length,
    scholarships: feed.filter((item) => item.category === "scholarship").length,
    services: feed.filter((item) => item.category === "service").length,
  };
  return (
    <section className="stats" aria-label="Feed summary">
      <div><span>Active alerts</span><strong>{counts.urgent}</strong></div>
      <div><span>Job matches</span><strong>{counts.jobs}</strong></div>
      <div><span>Scholarships</span><strong>{counts.scholarships}</strong></div>
      <div><span>Nearby services</span><strong>{counts.services}</strong></div>
    </section>
  );
}
