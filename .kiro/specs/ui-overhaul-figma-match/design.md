# Design Document: UI Overhaul — Figma Match

## Overview

This design covers the complete visual overhaul of the AromaSys warehouse management application to achieve pixel-perfect alignment with the approved Figma designs. The scope includes all public pages (Landing, Login, Register) and all authenticated dashboard pages, plus a redesigned chatbot experience as a floating overlay card.

**Key Constraints:**
- Only UI/CSS changes — all existing functionality (API calls, auth, database queries) must be preserved
- Interactive Floor Plan page is explicitly excluded
- All styling must use CSS variables from `globals.css` and follow `desain.md` strictly
- Tech stack: Next.js 16.2.6 (App Router), React 19, lucide-react, custom CSS with CSS variables, PostgreSQL via `pg`

**Approach:** Refactor existing page components and CSS files in-place. No new libraries or frameworks. The chatbot transitions from a separate route (`/copilot/chat`) to a floating overlay component rendered within the dashboard layout.

---

## Architecture

### High-Level Component Architecture

```mermaid
graph TD
    subgraph Public Pages
        LP[Landing Page<br>/page.js]
        LI[Login Page<br>/login/page.js]
        RE[Register Page<br>/register/page.js]
    end

    subgraph Dashboard Shell
        DL[Dashboard Layout<br>/(dashboard)/layout.js]
        SB[Sidebar Component]
        TB[Topbar - inline in layout]
        FCB[Floating Chatbot Button]
        CO[Chatbot Overlay Component - NEW]
    end

    subgraph Dashboard Pages
        DP[Dashboard /dashboard/page.js]
        FE[FIFO & Expiry]
        CC[Cold-Chain Monitor]
        DI[Data Ingestion Upload]
        AR[Auto-Report]
        IM[Inventory Master]
        AT[Audit Trail]
    end

    DL --> SB
    DL --> TB
    DL --> FCB
    FCB -->|click| CO
    DL --> DP
    DL --> FE
    DL --> CC
    DL --> DI
    DL --> AR
    DL --> IM
    DL --> AT
```

### Change Strategy

1. **In-place refactoring**: Each page's JSX and corresponding CSS file is updated to match Figma specs
2. **New component**: `ChatbotOverlay` — a modal-style overlay that replaces the `/copilot/chat` page route
3. **Sidebar refactor**: Update `Sidebar.js` + `Sidebar.css` to match dark-green Figma theme
4. **Layout refactor**: Update dashboard `layout.js` to use CSS classes instead of inline styles, integrate chatbot overlay state
5. **CSS-first approach**: All visual changes driven by CSS variables and class-based styling

### File Impact Map

| File | Change Type | Description |
|------|-------------|-------------|
| `src/app/page.js` | Refactor | Landing page — match Figma hero, navbar, gradient text |
| `src/app/login/page.js` + `login.css` | Refactor | Split-screen layout, material inputs, Figma colors |
| `src/app/register/page.js` | Refactor | Mirror login layout with registration fields |
| `src/app/(dashboard)/layout.js` | Refactor | Remove inline styles, add chatbot overlay state, green FAB |
| `src/components/Sidebar.js` + `Sidebar.css` | Refactor | Dark green theme, active state highlight, group labels |
| `src/app/(dashboard)/dashboard/page.js` + `dashboard.css` | Refactor | Stat cards, table, activity feed — Figma alignment |
| `src/app/(dashboard)/digital-twin/fifo-expiry/page.js` + CSS | Refactor | Color-coded table, filters, export button |
| `src/app/(dashboard)/digital-twin/cold-chain/page.js` + CSS | Refactor | Chart cards, zone status badges, threshold lines |
| `src/app/(dashboard)/copilot/upload/page.js` + CSS | Refactor | Drag-drop area, preview table, save/edit buttons |
| `src/app/(dashboard)/copilot/report/page.js` + CSS | Refactor | Parameter form, preview area, download button |
| `src/app/(dashboard)/settings/inventory/page.js` + CSS | Refactor | Data table, search, pagination, RBAC actions |
| `src/app/(dashboard)/settings/audit/page.js` + CSS | Refactor | Log table, date filters, export CSV |
| `src/components/ChatbotOverlay.js` + CSS | **New** | Modal overlay chat component |
| `src/app/globals.css` | Minor | Add any missing tokens if needed |

---

## Components and Interfaces

### 1. ChatbotOverlay (New Component)

```javascript
// src/components/ChatbotOverlay.js
interface ChatbotOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Behavior:**
- Renders a centered card (80% viewport width, 80% viewport height) with a semi-transparent black backdrop (50% opacity)
- Contains: header (title + close button), scrollable message area, fixed input bar at bottom
- Preserves conversation state across open/close within the same session (state lifted to layout)
- Closes on: close button click, backdrop click, Escape key press
- Reuses the existing Gemini API integration logic from the current `/copilot/chat/page.js`

**State Management:**
- `messages[]` state lifted to `DashboardLayout` so it persists across overlay open/close
- `isOverlayOpen` boolean in layout controls visibility
- `isTyping` state remains internal to the overlay

### 2. Sidebar (Refactored)

```javascript
// src/components/Sidebar.js — no interface change
// Visual-only refactor: CSS updates for dark green theme
```

**Visual Changes:**
- Background: `--color-brand-dark` (`#2C742F`)
- Active item: `rgba(255,255,255,0.15)` background + `#BCF389` text color
- Group labels: 11px uppercase, `rgba(255,255,255,0.5)` color
- Logo area: "AS" monogram + "AromaSys" + "SIMA AROME" subtitle
- Logout button at bottom with `LogOut` icon

### 3. Dashboard Layout (Refactored)

**Changes:**
- Replace inline styles with CSS classes referencing design tokens
- Replace orange `MessageSquare` FAB with green `Bot` FAB
- Add `ChatbotOverlay` component with state management
- Remove the `Link` to `/copilot/chat` — FAB now toggles overlay
- Topbar: search pill, notification dropdown, profile dropdown (existing logic preserved)

### 4. Landing Page (Refactored)

**Structure:**
- Top navbar: logo (leaf SVG + "AromaSys") left, "Sign In" outlined pill + "Sign Up" filled pill right
- Hero section: gradient heading ("Interactive Dashboard"), subtitle in Inter font
- Background: `#D7E5D8` (`--color-figma-bg`)
- Fade-in animation (600ms) with `prefers-reduced-motion` respect

### 5. Login / Register Pages (Refactored)

**Structure:**
- Split-screen: form left (50%), atmospheric image right (50%) with curved left edge (120px border-radius)
- Responsive: hide image panel at ≤1024px
- Material-style outlined inputs with floating labels
- "Back" link with arrow icon at top
- Primary submit button: `#366306` background, 45px height, 8px radius
- Footer: link to alternate auth page

### 6. Page Components (Dashboard Pages)

Each dashboard page follows the same pattern:
- Page header with title (Poppins, 32px, weight 700)
- Content wrapped in `.card` components (12px radius, white bg, shadow-sm)
- Tables use `.data-table` class with status-colored rows
- Loading state: centered spinner
- Error state: AlertCircle icon + retry button
- Empty state: icon + message + optional CTA

---

## Data Models

No data model changes. This overhaul is purely visual. All existing data structures, API routes, database schemas, and authentication flows remain unchanged.

**Existing data flow (preserved):**
- Auth: `useAuth()` hook → `/api/auth/login` and `/api/auth/register` → PostgreSQL
- Inventory: `/api/inventory` → PostgreSQL `inventory` table
- Cold-chain: `/api/cold-chain` → PostgreSQL `temperature_logs` table
- Audit: `/api/audit` → PostgreSQL `audit_logs` table
- Slots: `/api/slots` → PostgreSQL `warehouse_slots` table
- Chatbot: Client-side Gemini API call (unchanged)

**New state (client-only):**
```javascript
// In DashboardLayout
const [isChatOpen, setIsChatOpen] = useState(false);
const [chatMessages, setChatMessages] = useState([initialGreeting]);
```

---

## Error Handling

No changes to error handling logic. The existing error patterns are preserved:

| Scenario | Current Behavior | After Overhaul |
|----------|-----------------|----------------|
| API fetch failure | Shows error message | Same — styled with design system alert/error components |
| Auth failure | Inline error above form | Same — styled with `--color-status-critical` |
| Empty data | Shows placeholder text | Styled with `.empty-state` component |
| Chatbot API error | Shows error message in chat | Same — now inside overlay instead of separate page |
| Network timeout | Console error + fallback UI | Same — no logic change |

**New error scenario:**
- Chatbot overlay Gemini API failure: Display error message bubble in chat area, keep input enabled for retry (same behavior as current chat page, now in overlay context)

---

## Testing Strategy

### Why Property-Based Testing Does NOT Apply

This feature is a **UI rendering and layout overhaul**. It involves:
- CSS styling changes
- Component JSX restructuring
- Visual alignment to Figma designs
- No new algorithms, data transformations, or business logic

There are no universal properties that hold across input spaces. The correctness of this feature is determined by visual fidelity to Figma mockups, not by functional input/output relationships.

### Recommended Testing Approach

**1. Visual Regression Testing (Primary)**
- Capture screenshots of each page before and after the overhaul
- Compare against Figma reference images
- Tools: Manual comparison or Playwright screenshot assertions

**2. Example-Based Unit Tests**
- Chatbot overlay: test open/close behavior, Escape key dismissal, backdrop click
- Sidebar: test active state highlighting based on pathname
- Auth redirect: test that authenticated users redirect from login/register
- RBAC: test that Audit Trail is hidden for Operator/QC roles

**3. Integration Tests**
- Verify all existing API calls still work after UI refactor
- Verify auth flow (login → redirect → dashboard) is unbroken
- Verify chatbot Gemini API integration works in overlay context

**4. Accessibility Checks**
- All icon-only buttons have `aria-label`
- Form labels connected via `htmlFor`/`id`
- Alert banners use `role="alert"`
- Focus management on chatbot overlay open/close
- `prefers-reduced-motion` respected

**5. Responsive Testing**
- Desktop (≥1280px): full sidebar
- Tablet (768–1279px): collapsed sidebar
- Mobile (<768px): hidden sidebar
- Login/Register: image panel hidden at ≤1024px

### Test Execution

```bash
# Build verification (ensures no compile errors after refactor)
npm run build

# Lint check
npm run lint
```

Manual testing checklist per page:
- [ ] Visual match to Figma
- [ ] All interactive states work (hover, focus, active)
- [ ] Loading/error/empty states display correctly
- [ ] Responsive breakpoints behave correctly
- [ ] Existing functionality preserved (data loads, forms submit, navigation works)
- [ ] Chatbot overlay opens/closes, preserves messages, handles API errors
