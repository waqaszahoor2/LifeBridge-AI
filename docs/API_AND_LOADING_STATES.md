# LifeBridge AI — API Integration, Loading & Resilience Strategy

## 1. Overview & Resiliency Architecture

LifeBridge AI enforces robust API request handling through `@/lib/api.ts`. To ensure the application never hangs indefinitely or crashes when backend or external services are unreachable, all data fetching follows a standard timeout, fallback, and retry pattern.

---

## 2. API Request Layer Specifications

- **Base URL Configuration:** Managed dynamically via `process.env.NEXT_PUBLIC_API_BASE_URL` with fallback default to `http://localhost:8000`.
- **Request Timeout:** Enforced 8,000ms timeout using native `AbortController`.
- **Error Handling:** Typed `ApiError` class encapsulating HTTP status codes and error messages.
- **Graceful Fallbacks:** On network failure, offline status, or backend timeouts, endpoints seamlessly fallback to validated client-side datasets with clear `live: false` indicators.

---

## 3. UI State Lifecycle

```
[ Initializing ] 
      │
      ▼
[ Skeleton Loading State ] ──(Timeout / Network Error)──► [ Offline / Fallback State ] ──(Click Retry)──┐
      │                                                                                                  │
      ▼                                                                                                  │
[ Success / Live State ] ◄───────────────────────────────────────────────────────────────────────────────┘
      │
      ├─► [ Empty State ] (No items matching filter)
      └─► [ Error State ] (HTTP 500 / API Exception)
```

### 3.1 State Component Reference
- **Skeleton State:** `<FeedSkeleton />` displays animated pulse cards.
- **Error State:** `<FeedErrorState onRetry={fetchData} message="..." />` displays retry action button.
- **Offline State:** Banner indicator warning user that demo offline data is rendered.
- **Empty State:** `<FeedEmptyState resetFilters={...} />` presents helpful call to action.
