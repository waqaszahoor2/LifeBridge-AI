"use client";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { checkScam } from "@/lib/api";
import type { ScamCheckResult } from "@/lib/types";

export default function TrustScannerPage() {
  const [text, setText] = useState(""); const [url, setUrl] = useState(""); const [result, setResult] = useState<ScamCheckResult|null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(""); try { setResult(await checkScam(text,url)); } catch { setError("Backend unavailable. Start FastAPI or check NEXT_PUBLIC_API_BASE_URL."); } finally { setLoading(false); } }
  return <AppShell><TopBar title="VerifyLink Trust Scanner"/><PageIntro title="Check a suspicious message or URL" description="The prototype combines a local text classifier with transparent rules. It is decision support, not a guarantee."/><div className="tool-grid"><form className="tool-card" onSubmit={submit}><label>Message<textarea required minLength={3} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste a suspicious message..."/></label><label>URL (optional)<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com"/></label><button className="primary" disabled={loading}>{loading?"Checking…":"Run trust check"}</button>{error&&<p className="form-error">{error}</p>}</form>{result&&<section className={`result-card risk-${result.risk_level}`}><h2>{Math.round(result.risk_score*100)}% risk · {result.risk_level}</h2><h3>Evidence</h3><ul>{result.evidence.map(x=><li key={x}>{x}</li>)}</ul><h3>Safe actions</h3><ul>{result.safe_actions.map(x=><li key={x}>{x}</li>)}</ul><small>{result.model_version}</small></section>}</div></AppShell>;
}
