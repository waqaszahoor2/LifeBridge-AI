from datetime import UTC, datetime
import html
import re
import xml.etree.ElementTree as ET

import httpx
from sqlalchemy.orm import Session
import yaml

from app.core.config import get_settings
from app.services.feed_store import upsert_feed_item
from app.services.collectors.common import parse_datetime, stable_id, text

settings = get_settings()
TAG_RE = re.compile(r"<[^>]+>")


def load_sources() -> list[dict]:
    path = settings.resolve_project_path(settings.rss_sources_file)
    if not path.exists():
        return []
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    return [source for source in data.get("sources", []) if source.get("enabled")]


def _local_name(tag: str) -> str:
    return tag.split("}")[-1].lower()


def _child_text(element: ET.Element, *names: str) -> str:
    names_lower = {name.lower() for name in names}
    for child in element.iter():
        if _local_name(child.tag) in names_lower and child.text:
            return child.text.strip()
    return ""


def _link(element: ET.Element) -> str:
    for child in element.iter():
        if _local_name(child.tag) == "link":
            href = child.attrib.get("href")
            if href:
                return href
            if child.text:
                return child.text.strip()
    return ""


async def collect(db: Session, client: httpx.AsyncClient) -> int:
    if not settings.rss_enabled:
        return 0
    created = 0
    for source in load_sources():
        url = source.get("url")
        if not url or not url.startswith("https://"):
            continue
        response = await client.get(url)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        entries = [node for node in root.iter() if _local_name(node.tag) in {"item", "entry"}]
        for entry in entries[: int(source.get("limit", 50))]:
            title = _child_text(entry, "title") or "Opportunity update"
            link = _link(entry) or source.get("homepage") or url
            summary = _child_text(entry, "summary", "description", "content")
            summary = TAG_RE.sub(" ", html.unescape(summary))
            published = _child_text(entry, "published", "updated", "pubDate", "date")
            identifier = _child_text(entry, "id", "guid") or link
            created += int(upsert_feed_item(db, {
                "external_id": stable_id("rss", source.get("key"), identifier, title),
                "category": source.get("category", "scholarship"),
                "title": text(title, 250),
                "summary": text(summary or f"Update from {source.get('name', 'official feed')}"),
                "source_name": text(source.get("name") or "RSS/Atom feed", 180),
                "source_url": link,
                "published_at": parse_datetime(published, datetime.now(UTC)),
                "location": text(source.get("location") or "Global", 180),
                "tags": text(";".join(source.get("tags", [])), 1000),
                "severity": source.get("severity", "low"),
                "verification_status": source.get("verification_status", "verified"),
                "source_reliability": float(source.get("reliability", 0.8)),
                "raw_json": {"identifier": identifier, "feed": url},
            }))
    db.commit()
    return created
