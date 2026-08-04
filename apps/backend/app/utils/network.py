from ipaddress import ip_address
import socket
from urllib.parse import urlparse

from fastapi import HTTPException

ALLOWED_SCHEMES = {"http", "https"}
BLOCKED_HOSTS = {"localhost", "metadata.google.internal"}


def validate_public_url(value: str) -> str:
    """Reject obvious SSRF targets before any server-side request."""
    parsed = urlparse(value)
    if parsed.scheme not in ALLOWED_SCHEMES or not parsed.hostname:
        raise HTTPException(status_code=422, detail="Only public http/https URLs are supported")
    host = parsed.hostname.lower().rstrip(".")
    if host in BLOCKED_HOSTS or host.endswith(".local"):
        raise HTTPException(status_code=422, detail="Private or local hosts are not allowed")
    try:
        candidates = {info[4][0] for info in socket.getaddrinfo(host, parsed.port or 443)}
    except socket.gaierror as exc:
        raise HTTPException(status_code=422, detail="URL hostname cannot be resolved") from exc
    for candidate in candidates:
        address = ip_address(candidate)
        if address.is_private or address.is_loopback or address.is_link_local or address.is_reserved:
            raise HTTPException(status_code=422, detail="Private network addresses are not allowed")
    return value
