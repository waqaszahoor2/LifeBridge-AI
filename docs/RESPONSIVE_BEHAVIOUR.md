# LifeBridge AI — Responsive Behaviour Specification

## 1. Responsive Strategy & Breakpoints

LifeBridge AI employs a mobile-first, desktop-optimized responsive design. Instead of simply scaling down desktop elements, mobile layouts adapt layout structures intentionally.

### 1.1 Breakpoint System

```css
/* Mobile Small */
@media (max-width: 375px) { ... }

/* Mobile Standard */
@media (max-width: 600px) { ... }

/* Tablet Portfolio */
@media (max-width: 900px) { ... }

/* Desktop Standard */
@media (min-width: 1024px) { ... }

/* Large Widescreen */
@media (min-width: 1440px) { ... }
```

---

## 2. Component Adaptation Matrix

| Component | Desktop (>= 1280px) | Tablet (768px - 1024px) | Mobile (< 600px) |
| :--- | :--- | :--- | :--- |
| **Header** | Sticky top bar with page title, refresh action, notifications, theme menu, user profile avatar | Sticky top bar, compact title, notifications icon, avatar menu | Compact sticky header bar with logo/title & notifications |
| **Left Sidebar** | 240px fixed left sidebar with brand logo, main navigation, AI companion card, settings | Collapsible drawer menu triggered by header hamburger toggle | Replaced by fixed bottom navigation bar (`MobileBottomNav.tsx`) |
| **Right Sidebar** | 320px fixed right rail with Weather, Quick Services, Stay Safe, Daily Tip | Collapsed into collapsible widgets below central feed | Rendered as horizontal carousel cards between feed sections |
| **Feed Cards** | 3-column middle container with thumbnail images, badges, metadata, & metrics | Full width middle feed cards with responsive image ratios | Single-column edge-to-edge cards with 14px padding & 44px+ touch targets |
| **Category Chips**| Wrap or scrollable chip bar | Horizontally scrollable chip row | Horizontally scrollable chip bar with touch snap |
| **Tool Forms** | Multi-column grid with side-by-side output panel | Stacked input & output cards | Multi-step tabbed workflow or full-screen modal drawer |
