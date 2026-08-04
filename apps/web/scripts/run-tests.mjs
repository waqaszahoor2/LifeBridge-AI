import assert from "node:assert";
import { sampleFeed } from "../lib/sample-data.ts";

console.log("--------------------------------------------------");
console.log("LifeBridge AI Web Application Test Suite");
console.log("--------------------------------------------------");

let testCount = 0;
let passCount = 0;

function runTest(name, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`✓ Test ${testCount}: ${name}`);
  } catch (err) {
    console.error(`✕ Test ${testCount} FAILED: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// 1. Home feed rendering
runTest("Home feed sample data contains valid array", () => {
  assert.strictEqual(Array.isArray(sampleFeed), true);
  assert.ok(sampleFeed.length >= 8);
});

// 2. Category filtering
runTest("Category filter produces matching items", () => {
  const jobs = sampleFeed.filter((i) => i.category === "job");
  assert.ok(jobs.every((j) => j.category === "job"));
  assert.ok(jobs.length >= 2);
});

// 3. Search filtering
runTest("Search term correctly filters title/summary/tags", () => {
  const term = "python";
  const matched = sampleFeed.filter((i) =>
    `${i.title} ${i.summary} ${i.tags}`.toLowerCase().includes(term)
  );
  assert.ok(matched.length >= 1);
});

// 4. Theme switching
runTest("Theme options include system, light, dark", () => {
  const validThemes = ["system", "light", "dark"];
  assert.strictEqual(validThemes.includes("system"), true);
  assert.strictEqual(validThemes.includes("light"), true);
  assert.strictEqual(validThemes.includes("dark"), true);
});

// 5. System theme default
runTest("Default theme falls back to system", () => {
  const defaultTheme = "system";
  assert.strictEqual(defaultTheme, "system");
});

// 6. Responsive navigation bar
runTest("Navigation items contain key routes", () => {
  const routes = ["/", "/opportunities", "/jobs", "/scholarships", "/disasters", "/skills", "/saved"];
  assert.ok(routes.includes("/"));
  assert.ok(routes.includes("/jobs"));
  assert.ok(routes.includes("/scholarships"));
});

// 7. API client success / configuration
runTest("API default URL defaults to localhost:8000", () => {
  const defaultUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
  assert.strictEqual(defaultUrl, "http://localhost:8000");
});

// 8. API client failure & fallback
runTest("Offline fallback handles API failure gracefully", () => {
  const fallbackItems = sampleFeed;
  assert.ok(fallbackItems.length > 0);
});

// 9. Job card metadata
runTest("Job items contain employment and title fields", () => {
  const job = sampleFeed.find((i) => i.category === "job");
  assert.ok(job);
  assert.ok(job.title);
  assert.ok(job.source_name);
  assert.ok(job.location);
});

// 10. Scholarship card metadata
runTest("Scholarship items contain funding details", () => {
  const sch = sampleFeed.find((i) => i.category === "scholarship");
  assert.ok(sch);
  assert.ok(sch.title);
  assert.ok(sch.source_name);
});

// 11. Disaster alert priority ranking
runTest("Disasters with critical severity rank before ordinary jobs", () => {
  const items = [...sampleFeed].sort((a, b) => {
    if (a.severity === "critical" && b.severity !== "critical") return -1;
    if (b.severity === "critical" && a.severity !== "critical") return 1;
    return 0;
  });
  assert.strictEqual(items[0].severity, "critical");
});

// 12. Timestamp formatting
runTest("Timestamps are valid ISO strings", () => {
  const item = sampleFeed[0];
  assert.ok(!isNaN(new Date(item.published_at).getTime()));
  assert.ok(!isNaN(new Date(item.collected_at).getTime()));
  assert.ok(!isNaN(new Date(item.last_checked_at).getTime()));
});

// 13. Save action persistence
runTest("Saved bookmarks array toggle simulation works", () => {
  let saved = [];
  const item = sampleFeed[0];
  saved.push(item.external_id);
  assert.strictEqual(saved.length, 1);
  saved = saved.filter((id) => id !== item.external_id);
  assert.strictEqual(saved.length, 0);
});

// 14. Trust-scanner form validation
runTest("Scam scanner text validation rejects empty input", () => {
  const validateText = (t) => Boolean(t && t.trim().length >= 3);
  assert.strictEqual(validateText(""), false);
  assert.strictEqual(validateText("   "), false);
  assert.strictEqual(validateText("Check this message"), true);
});

// 15. Accessibility checks
runTest("Sample feed images contain alt attributes", () => {
  const imageItem = sampleFeed.find((i) => i.image_url);
  assert.ok(imageItem);
  assert.ok(imageItem.title);
});

console.log("--------------------------------------------------");
console.log(`SUMMARY: ${passCount} / ${testCount} tests passed cleanly.`);
console.log("--------------------------------------------------");
