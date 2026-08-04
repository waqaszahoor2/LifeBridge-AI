import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
export default function SavedPage(){return <AppShell><TopBar title="Saved Items"/><PageIntro title="Bookmarks and reminders" description="Authenticated users can save feed items and set deadline reminders through the /api/v1/saved endpoints."/><div className="empty-state">Sign in and save a feed item to see it here.</div></AppShell>}
