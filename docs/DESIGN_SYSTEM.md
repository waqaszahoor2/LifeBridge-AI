# LifeBridge AI — Design System Documentation

## 1. Vision & Core Principles

The LifeBridge AI Design System delivers a clean, accessible, mature, and trustworthy interface for civic safety, educational opportunities, and digital trust verification. Inspired by modern professional communication tools and civic service dashboards, it balances clear visual hierarchy, soft surfaces, precise typography, and dark/light mode compatibility.

---

## 2. Color Palette & Tokens

### 2.1 Brand & Neutral Tokens (CSS Variables)

```css
:root {
  /* Brand Primary Colors */
  --color-primary-navy: #12315A;
  --color-primary-teal: #078F87;
  --color-bright-teal: #0DA7A0;
  --color-primary-blue: #1769E8;

  /* Surfaces & Backgrounds (Light Mode) */
  --bg-app: #F4F7FA;
  --bg-card: #FFFFFF;
  --bg-card-hover: #F8FAFC;
  --bg-sidebar: #FFFFFF;
  --bg-header: #FFFFFF;
  --bg-muted: #EEF2F6;
  --bg-subtle: #F0F4F8;

  /* Typography Colors */
  --text-primary: #152033;
  --text-secondary: #5F6B7A;
  --text-muted: #8190A3;
  --text-on-brand: #FFFFFF;

  /* Border & Divider */
  --border-color: #DFE5EC;
  --border-subtle: #E8EEF5;
  --border-strong: #CBD5E1;

  /* Status Colors */
  --urgent-red: #D92D3A;
  --urgent-red-bg: #FDF2F2;
  --urgent-red-border: #F87171;
  
  --warning-amber: #E89018;
  --warning-amber-bg: #FFFBEB;
  --warning-amber-border: #FCD34D;
  
  --success-green: #16865C;
  --success-green-bg: #F0FDF4;
  --success-green-border: #86EFAC;

  --info-blue: #1769E8;
  --info-blue-bg: #EFF6FF;
  --info-blue-border: #93C5FD;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(18, 49, 90, 0.05);
  --shadow-card: 0 2px 10px rgba(15, 35, 60, 0.04), 0 1px 3px rgba(15, 35, 60, 0.02);
  --shadow-lg: 0 10px 25px -5px rgba(15, 35, 60, 0.08), 0 8px 10px -6px rgba(15, 35, 60, 0.04);
}

/* Dark Mode Tokens */
[data-theme="dark"] {
  --bg-app: #0B131E;
  --bg-card: #131E2E;
  --bg-card-hover: #1A283C;
  --bg-sidebar: #101926;
  --bg-header: #101926;
  --bg-muted: #1E2D42;
  --bg-subtle: #172436;

  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --text-on-brand: #FFFFFF;

  --border-color: #1E2E44;
  --border-subtle: #17253B;
  --border-strong: #334155;

  --urgent-red-bg: #2C1217;
  --warning-amber-bg: #2B1D0C;
  --success-green-bg: #0D261B;
  --info-blue-bg: #0F2342;

  --shadow-card: 0 2px 10px rgba(0, 0, 0, 0.3);
}
```

---

## 3. Typography System

| Usage | Font Size (Desktop) | Font Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title** | 28px (1.75rem) | 650 | 1.3 | -0.02em |
| **Section Title** | 20px (1.25rem) | 600 | 1.35 | -0.01em |
| **Card Title** | 18px (1.125rem) | 600 | 1.4 | -0.01em |
| **Body Regular** | 14px (0.875rem) | 400 | 1.55 | Normal |
| **Navigation** | 14px (0.875rem) | 500 | 1.4 | Normal |
| **Buttons** | 14px (0.875rem) | 500/600 | 1.25 | Normal |
| **Metadata / Captions**| 12px (0.75rem) | 400 | 1.4 | Normal |
| **Category Badges** | 11px (0.6875rem)| 600 | 1.2 | +0.03em UPPERCASE |

---

## 4. Spacing & Elevation System

- **Base Grid:** 8px (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`)
- **Border Radius:**
  - Controls / Inputs: `8px`
  - Cards / Widgets: `14px`
  - Banners / Modals: `18px`
  - Pill Badges: `9999px`
