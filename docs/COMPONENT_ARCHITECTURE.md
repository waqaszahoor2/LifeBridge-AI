# LifeBridge AI — Component Architecture Document

## 1. Architectural Principles

1. **Modular Separation of Concerns:** Components are strictly separated into layout containers (`components/layout`), post-type feed cards (`components/feed`), dashboard widgets (`components/widgets`), interactive forms (`components/forms`), visualizations (`components/visualization`), and UI primitive tokens (`components/ui`).
2. **Type Safety & Design Tokens:** All props utilize strict TypeScript interfaces exported from `@/lib/types`. Hardcoded styling is replaced with CSS variables defined in `@/app/globals.css`.
3. **Resilience & Fallbacks:** Components gracefully handle loading, empty, offline, and error states without throwing SSR hydration errors or crashing the application shell.

---

## 2. Component Hierarchy Diagram

```
AppShell
├── Sidebar (Desktop Left Navigation)
│   ├── BrandLogo & Subtitle
│   ├── SidebarNavList (For You, Latest, Jobs, Scholarships, Disasters, Weather, Services, Safety, Learning)
│   ├── AssistantPromoCard ("LifeBridge AI Assistant Beta")
│   └── SidebarFooterLinks (Settings, Help & Support, Log Out)
│
├── MainColumn
│   ├── Header (Sticky Top Bar)
│   │   ├── TitleBlock (Page Title & Subtitle)
│   │   └── RightActions (RefreshBtn, NotificationBell, ThemeToggle, UserAvatarGreeting)
│   │
│   └── ContentBody (Page Content)
│       ├── ForYouPage
│       │   ├── UrgentAlertBanner ("URGENT FLOOD ALERT", High Risk, Source, View Affected Areas)
│       │   ├── FeedFilters (Category Chips & Sort Dropdown)
│       │   ├── ThreeColumnLayoutGrid
│       │   │   ├── CenterFeedColumn
│       │   │   │   ├── FeedCard (DisasterUpdateCard, ScholarshipCard, JobCard, ServiceCard, LearningCard)
│       │   │   │   ├── NewUpdatesBanner
│       │   │   │   └── SentinelIntersectionObserver (Infinite Scroll)
│       │   │   └── RightSidebar
│       │   │       ├── WeatherWidget ("Guwahati, Assam", 26°C, Cloudy, 4-day forecast)
│       │   │       ├── QuickServicesWidget (Telemedicine, Ambulance, Blood Donor, Nearby Shelter)
│       │   │       ├── StaySafeWidget ("Share Location")
│       │   │       └── DailyTipWidget ("Stay informed, stay prepared, stay safe")
│       │   └── FeedEmptyState / FeedErrorState / FeedSkeleton
│       │
│       ├── SkillBridgePage (CV Upload, Drag & Drop, Extracted Skills, Skill Gap, Recommendations, Bar/Radar Chart)
│       ├── DecisionGraphPage (Interactive Node Graph Canvas, Zoom, Pan, Node Drawer, Filters, Legend)
│       ├── DisasterLinkPage (Real-time Safety Dashboard, Emergency Banner, Interactive Map Simulator, Shelter Context)
│       ├── VerifyLinkPage (Trust Scanner Workspace, Evidence Matrix, Risk Gauge, Domain Check, Safe Actions)
│       ├── AccessLinkPage & ServiceLinkPage (LocationPicker with Geolocator, Address Search, Category Tabs, Distance Slider)
│       ├── OpportunitiesPage (Tabbed Jobs/Scholarships/Learning Explorer, Multi-field Filters, Sorting)
│       ├── ProfilePage (Multi-tab Profile & Preference Center, Completion Score Progress Bar)
│       ├── SavedPage (Bookmark Explorer with Category Tabs, Deadline Countdown Sorting, Export)
│       └── AboutPage (5 Data Science Capabilities Showcase, Interactive SVG Architecture Diagram)
│
└── MobileNav (Fixed Mobile Bottom Navigation: Home, Opportunities, Alerts, Services, Profile)
```
