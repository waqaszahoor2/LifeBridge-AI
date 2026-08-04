"use client";

import { useEffect, useState } from "react";

export function RelativeTime({ value }: { value: string }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const date = new Date(value);
  const minutes = Math.max(0, Math.round((now - date.getTime()) / 60000));
  const relative = minutes < 60
    ? `${minutes} min ago`
    : minutes < 1440
    ? `${Math.floor(minutes / 60)} h ago`
    : `${Math.floor(minutes / 1440)} d ago`;

  return <time dateTime={value} title={date.toLocaleString()}>{relative}</time>;
}
