"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface BuildInfo {
  version: string;
  commit: string;
  branch: string;
  environment: string;
  built_at: string;
}

export function AppFooter() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

  const [failedBuildInfo, setFailedBuildInfo] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/build-info")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.commit) {
          setBuildInfo(data);
          setFailedBuildInfo(false);
        } else {
          setFailedBuildInfo(true);
        }
      })
      .catch(() => {
        setFailedBuildInfo(true);
      });
  }, []);

  const commitShort = buildInfo?.commit ? buildInfo.commit.slice(0, 7) : "";

  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-8 px-4 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            LB
          </div>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">LifeBridge AI</span>
            <span className="mx-2 text-slate-300 dark:text-slate-700">•</span>
            <span>© {new Date().getFullYear()} LifeBridge Platform. All rights reserved.</span>
          </div>
        </div>

        {/* Center: Essential Footer Navigation */}
        <div className="flex items-center gap-4 flex-wrap justify-center font-medium">
          <Link href="/about" className="hover:text-primary-600 transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-primary-600 transition-colors">
            Privacy & Terms
          </Link>
          <Link href="/help" className="hover:text-primary-600 transition-colors">
            Help Center
          </Link>
          <Link href="/trust-scanner" className="hover:text-primary-600 transition-colors">
            Trust & Safety
          </Link>
          <Link href="/accessibility" className="hover:text-primary-600 transition-colors">
            Accessibility
          </Link>
        </div>

        {/* Right: Environment & Dynamic Build Metadata */}
        <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
          <Icon name="shield" size={13} className="text-teal-600 dark:text-teal-400" />
          {failedBuildInfo ? (
            <span>Build information unavailable</span>
          ) : (
            <>
              <span>v{buildInfo?.version || "1.0.0"}</span>
              {commitShort && <span className="text-slate-400">({commitShort})</span>}
              {buildInfo?.environment && (
                <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {buildInfo.environment}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
