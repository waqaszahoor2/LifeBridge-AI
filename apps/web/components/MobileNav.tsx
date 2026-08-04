import Link from "next/link";

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <Link href="/">Home</Link>
      <Link href="/opportunities">Jobs</Link>
      <Link href="/skills">Skills</Link>
      <Link href="/disasters">Alerts</Link>
      <Link href="/trust-scanner">Verify</Link>
      <Link href="/profile">Profile</Link>
    </nav>
  );
}
