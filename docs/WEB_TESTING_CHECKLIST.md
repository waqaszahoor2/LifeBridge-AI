# LifeBridge AI — Web Quality & Testing Checklist

This checklist documents automated and manual testing steps for verifying the web application prior to production deployment.

---

## Automated Verification Matrix

| Verification Step | Command | Status |
| :--- | :--- | :--- |
| **ESLint Audit** | `npm run lint` | ✅ PASSED (0 errors, 0 warnings) |
| **TypeScript Strict Check** | `npm run typecheck` | ✅ PASSED (0 errors) |
| **Automated Test Suite** | `npm test` | ✅ PASSED (15 / 15 test cases) |
| **Production Build** | `npm run build` | ✅ PASSED (19 static routes prerendered) |

---

## Manual QA Matrix Across Viewports

- **Mobile (320px – 430px)**: Bottom navigation bar renders cleanly, cards stack vertically without horizontal scrollbar.
- **Tablet (768px)**: Grid adjusts adaptively, search bar expands.
- **Laptop / Desktop (1024px – 1920px)**: Left navigation sidebar fixed, right rail active with personalized match rules and decision graph highlights.
- **Theme Modes**: System default, Light mode, and Dark mode verified with high contrast.
