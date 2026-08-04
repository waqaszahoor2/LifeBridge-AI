export function SourceBadge({ status }: { status: string }) {
  const label = status === "verified" ? "Verified source" : status === "demo" ? "Demo record" : status;
  return <span className={`source-badge ${status}`}>{label}</span>;
}
