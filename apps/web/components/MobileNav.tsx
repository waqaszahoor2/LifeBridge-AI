"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./ui/Icon";

const mobileLinks: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/for-you", label: "Home", icon: "sparkles" },
  { href: "/skills/mentor", label: "Skills", icon: "academic" },
  { href: "/opportunities", label: "Explore", icon: "clock" },
  { href: "/disasters", label: "Alerts", icon: "alert" },
  { href: "/profile", label: "Profile", icon: "user" },
];


export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lb-mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {mobileLinks.map((item) => {
        const isActive = pathname === item.href || (item.href === "/for-you" && pathname === "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? "active" : ""}`}
          >
            <Icon name={item.icon} size={20} className="mobile-nav-icon" />
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

