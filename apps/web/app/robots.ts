import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/login/"],
    },
    sitemap: "https://life-bridge-ai-ten.vercel.app/sitemap.xml",
  };
}
