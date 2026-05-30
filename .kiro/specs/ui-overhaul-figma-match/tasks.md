# Implementation Plan: UI Overhaul — Figma Match

## Overview

This plan covers the complete visual refactoring of the AromaSys application to match approved Figma designs. All tasks involve CSS and JSX changes only — no business logic modifications. The chatbot transitions from a separate page route to a floating overlay component. Work is organized to maximize parallel execution: foundational tokens and shared components first, then individual page refactors in parallel, followed by integration and final wiring.

## Tasks

- [x] 1. Foundation: Design tokens and shared component styles
  - [x] 1.1 Update `globals.css` with missing design tokens and Figma-specific variables
    - Audit existing CSS variables against `desain.md` and Figma specs
    - Add any missing tokens (e.g., chatbot overlay backdrop, FAB shadow tokens)
    - Ensure all color, spacing, radius, and typography tokens are complete
    - Add `.chatbot-overlay-backdrop`, `.fab-chatbot` utility classes
    - Verify `prefers-reduced-motion` rule covers all new animations
    - _Requirements: 14.1, 14.3, 14.4, 14.5_

- [x] 2. Sidebar component refactor
  - [x] 2.1 Refactor `Sidebar.js` and `Sidebar.css` to match Figma dark-green theme
    - Update background to `--color-brand-dark` (`#2C742F`)
    - Implement active item highlight: `rgba(255,255,255,0.15)` bg + `#BCF389` text
    - Add group labels: 11px uppercase, `rgba(255,255,255,0.5)` color
    - Style logo area: "AS" monogram + "AromaSys" + "SIMA AROME" subtitle
    - Style logout button at bottom with `LogOut` icon
    - Ensure nav items use 20px icons, 44px height, 8px border-radius
    - Verify RBAC: Audit Trail hidden for Operator/QC roles (existing logic preserved)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 14.2, 14.6_

- [x] 3. Dashboard layout shell refactor
  - [x] 3.1 Refactor `(dashboard)/layout.js` — remove inline styles, use CSS classes
    - Replace all inline `style={{}}` objects with CSS class references from `globals.css`
    - Topbar: use `.topbar`, `.topbar-left`, `.topbar-right` classes consistently
    - Search input: rounded pill, `#F5F6FA` background, 388px width
    - Notification dropdown: 254px, `#EEF3E7` bg, 12px radius (preserve existing logic)
    - Profile dropdown: 205px, `#EEF3E7` bg, 12px radius (preserve existing logic)
    - Content area: apply `var(--color-figma-bg)` background
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 14.1, 14.4_

  - [x] 3.2 Replace chatbot FAB — change from orange `MessageSquare` Link to green `Bot` button
    - Remove the `<Link href="/copilot/chat">` FAB
    - Add a `<button>` with `Bot` icon from lucide-react
    - Use `#366306` (green) background instead of `#FF8A00` (orange)
    - 74px circular, fixed bottom-right 32px, `box-shadow: 0 8px 24px rgba(54,99,6,0.4)`
    - Button toggles `isChatOpen` state (onClick handler)
    - _Requirements: 13.1, 13.2, 13.3, 4.5_

  - [x] 3.3 Add chatbot overlay state management to layout
    - Add `const [isChatOpen, setIsChatOpen] = useState(false)`
    - Add `const [chatMessages, setChatMessages] = useState([initialGreeting])`
    - Import and render `<ChatbotOverlay>` component conditionally
    - Pass `isOpen`, `onClose`, `messages`, `setMessages` props
    - _Requirements: 13.4, 13.8, 13.9_

- [~] 4. Checkpoint — Ensure layout shell builds correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. ChatbotOverlay new component
  - [x] 5.1 Create `ChatbotOverlay.js` and `ChatbotOverlay.css` in `src/components/`
    - Build modal overlay: centered card 80% viewport width × 80% viewport height
    - Semi-transparent black backdrop (50% opacity)
    - Header: "Production Copilot" title + close button (X icon)
    - Scrollable message area: user bubbles right-aligned, AI bubbles left-aligned
    - Fixed input bar at bottom with text input + send button
    - Green theme (`#366306`) for AI avatar and accent elements
    - Close on: close button, backdrop click, Escape key
    - Reuse Gemini API integration logic from existing `/copilot/chat/page.js`
    - Handle API error: show error message bubble, keep input enabled for retry
    - Focus management: trap focus inside overlay when open, return focus on close
    - Add `aria-modal="true"`, `role="dialog"`, `aria-label="Production Copilot"`
    - _Requirements: 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10, 14.6_

- [x] 6. Landing page refactor
  - [x] 6.1 Refactor `src/app/page.js` to match Figma landing design
    - Top navbar: leaf SVG + "AromaSys" logo left; "Sign In" outlined pill + "Sign Up" filled pill right
    - Hero section: gradient heading ("Interactive Dashboard") — Poppins 48px+, `linear-gradient(135deg, #BCF389 0%, #366306 100%)` with `-webkit-background-clip: text`
    - Subtitle: Inter font, color `#848484`
    - Full-page background: `#D7E5D8` (`--color-figma-bg`)
    - Fade-in animation 600ms using `fadeIn` keyframe, respect `prefers-reduced-motion`
    - Auth redirect: if authenticated, redirect to `/dashboard`
    - Loading state while auth status is determined
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 14.5_

- [x] 7. Login page refactor
  - [x] 7.1 Refactor `src/app/login/page.js` and `login.css` to match Figma split-screen design
    - Split-screen: form left 50%, atmospheric image right 50% with 120px curved left edge
    - Responsive: hide image panel at ≤1024px
    - "Back" link with left arrow icon at top, navigating to `/`
    - Title: "Sign In" (Poppins weight 600), subtitle: "Sign In to your AromaSys account"
    - Material-style outlined inputs: Email, Password (show/hide toggle), Role dropdown
    - "Remember me" checkbox left + "Forgot Password" link red (`#EA4B48`) right
    - Primary submit button: full-width, `#366306` bg, 45px height, 8px radius
    - Footer: "Don't have an account? Sign Up" linking to `/register`
    - Preserve existing validation and error display logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 14.1_

- [x] 8. Register page refactor
  - [x] 8.1 Refactor `src/app/register/page.js` to match Figma design (mirror login layout)
    - Same split-screen layout as login page
    - Fields: Full Name, Email, Password (toggle), Confirm Password (toggle), Role dropdown
    - Primary submit button: "Sign Up", full-width
    - Footer: "Already have an account? Sign In" linking to `/login`
    - Preserve existing validation (password match, API error display)
    - Add `register.css` if needed for page-specific styles
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 14.1_

- [x] 9. Main Dashboard page refactor
  - [x] 9.1 Refactor `src/app/(dashboard)/dashboard/page.js` and `dashboard.css`
    - Page header: "Dashboard Overview" using `.page-title` class
    - Four stat cards in `.grid-4` layout: Total Active Items, Expiring Soon, Warehouse Capacity, Cold-Chain Zones
    - Alert banners: 4px left border (red for critical, yellow for warning)
    - Table "Items Requiring Immediate Use": Name, Lot Number (monospace), Expiry Date, Status badge
    - Quick action buttons: "Ask Copilot", "View Floor Plan"
    - Card styling: 12px radius, white bg, `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
    - Loading state: centered spinner; Error state: AlertCircle + retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 14.1, 14.2, 14.3_

- [x] 10. FIFO & Expiry page refactor
  - [x] 10.1 Refactor `src/app/(dashboard)/digital-twin/fifo-expiry/page.js` and `fifo-expiry.css`
    - Data table columns: material name, item ID, intake date, location slot, status badge, expiry timeline
    - Color-coded rows: red (`#FDEDEC`) for <7 days/expired, yellow (`#FEF9E7`) for 7-29 days, transparent for 30+
    - Status badges: "CRITICAL" (red), "WARNING" (yellow), "SAFE" (green) using `.badge-*` classes
    - Filter controls: zone filter, material category filter
    - "Export Excel" button
    - Error state and empty state styling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 14.1, 14.6_

- [x] 11. Cold-Chain Monitor page refactor
  - [x] 11.1 Refactor `src/app/(dashboard)/digital-twin/cold-chain/page.js` and `cold-chain.css`
    - Temperature charts with time X-axis, °C Y-axis, dashed threshold lines
    - Zone status badges: green (safe), yellow (warning), red (danger)
    - Red alert indicators for anomalous readings with timestamps
    - Card component wrapping each zone panel
    - Loading state and error state styling
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 14.1, 14.3_

- [x] 12. Data Ingestion page refactor
  - [x] 12.1 Refactor `src/app/(dashboard)/copilot/upload/page.js` and `upload.css`
    - Drag-and-drop area: dashed border, upload icon, instructional text (PDF, JPG, JPEG, PNG, XLSX, CSV, max 10MB)
    - Processing indicator during extraction
    - Preview table: material name, parsed quantity, extracted lot number
    - "Save to Database" primary button + "Edit Results" secondary button
    - Card styling for upload area and preview panels
    - Error state: AlertCircle icon + error message + retry button
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 14.1, 14.3_

- [x] 13. Auto-Report page refactor
  - [x] 13.1 Refactor `src/app/(dashboard)/copilot/report/page.js` and `report.css`
    - Parameter form: date range (start/end), report type dropdown (4 options), format selection (PDF/Excel)
    - "Generate" primary button + "Download" secondary button (disabled until generated)
    - Loading indicator during generation
    - Preview area: KPI summary section + sample data table
    - Validation: end date < start date shows inline error
    - Empty state for no data in selected period
    - Card and input component styling from design system
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 14.1_

- [x] 14. Inventory Master page refactor
  - [x] 14.1 Refactor `src/app/(dashboard)/settings/inventory/page.js` and `inventory.css`
    - Data table: ID (monospace), Name, Category, Quantity, Location, Date Added, Expiry Date, Status badge
    - Search input filtering by Name and ID; dropdown filters for category, zone, status
    - Pagination: 10 items/page, prev/next buttons, page indicators
    - RBAC: Edit/Delete buttons visible for QC/Admin only, hidden for Operator/PPIC
    - Table styling: row hover, uppercase headers, status-colored row backgrounds
    - Error state with retry; empty state with reset filters suggestion
    - Loading indicator in table area
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 14.1, 14.6_

- [x] 15. Audit Trail page refactor
  - [x] 15.1 Refactor `src/app/(dashboard)/settings/audit/page.js` and `audit.css`
    - Log table: Timestamp, User Name, Role, Action, Change Details, Module — sorted newest first
    - Filter controls: date range (start/end), user name; display matching entry count
    - "Export Log" button generating CSV download
    - No edit/delete functionality for log entries
    - Monospace formatting for Timestamp and ID values
    - Role-based access: redirect non-PPIC/Admin users to Dashboard
    - Empty state for no matching filters
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 14.1, 14.5_

- [~] 16. Final checkpoint — Ensure all pages build and render correctly
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm run build` to verify no compile errors
  - Run `npm run lint` to verify no lint issues
  - Verify all existing functionality is preserved (auth flow, API calls, data loading)

## Notes

- This is a UI-only overhaul — no business logic, API routes, or database changes
- The Interactive Floor Plan page (`/digital-twin/floor-plan`) is explicitly excluded
- All styling must use CSS variables from `globals.css` — no hardcoded hex values in components
- The chatbot transitions from a separate route (`/copilot/chat`) to an overlay component
- Existing auth, RBAC, and data-fetching logic must be preserved exactly
- No property-based tests apply — this feature has no algorithmic properties to verify
- Visual correctness is validated by Figma comparison and build verification

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "6.1", "7.1", "8.1"] },
    { "id": 2, "tasks": ["3.1", "3.2", "5.1"] },
    { "id": 3, "tasks": ["3.3"] },
    { "id": 4, "tasks": ["9.1", "10.1", "11.1", "12.1", "13.1", "14.1", "15.1"] }
  ]
}
```
