import Link from "next/link";

const links = [
  ["/", "Home Feed"],
  ["/opportunities", "Opportunities"],
  ["/skills", "SkillBridge"],
  ["/decision-graph", "Decision Graph"],
  ["/disasters", "DisasterLink"],
  ["/trust-scanner", "VerifyLink"],
  ["/accessibility", "AccessLink"],
  ["/services", "ServiceLink"],
  ["/profile", "Profile"],
  ["/saved", "Saved"],
  ["/about", "About"],
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand" aria-label="LifeBridge AI home">
        <span>LB</span><strong>LifeBridge AI</strong>
      </Link>
      <nav aria-label="Main navigation">
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="privacy-note">API secrets stay only in the FastAPI backend.</div>
    </aside>
  );
}
