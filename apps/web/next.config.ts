import type { NextConfig } from "next";

const BUILD_TIME = process.env.APP_BUILD_TIMESTAMP || "2026-08-06T10:00:00.000Z";

const nextConfig: NextConfig = {
  env: {
    APP_BUILD_TIMESTAMP: BUILD_TIME,
  },
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "eonet.gsfc.nasa.gov" },
      { protocol: "https", hostname: "*.reliefweb.int" },
      { protocol: "https", hostname: "*.openstreetmap.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline'",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"} https://images.unsplash.com`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
