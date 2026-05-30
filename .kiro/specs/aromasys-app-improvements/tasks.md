# Implementation Plan: AromaSys App Improvements

## Overview

This plan implements 8 improvement areas for the AromaSys Warehouse Management System: functional pagination on FIFO & Expiry page, informative dashboard with recharts visualization, profile photo upload with audit trail display, dynamic notification badge with React Context sync, inventory detail card modal with image upload, landing page branding, auth page text overlay, and database migration for avatar/image columns. Each task builds incrementally on previous steps, ending with full integration.

## Tasks

- [x] 1. Database migration and API foundation
  - [x] 1.1 Update database schema in init-db.js
    - Add `avatar TEXT DEFAULT NULL` column to users table
    - Add `image TEXT DEFAULT NULL` column to inventory table
    - Ensure columns are created on fresh init and are backward-compatible
    - _Requirements: 8.1, 8.2_

  - [x] 1.2 Create GET /api/dashboard/stats endpoint
    - Create `src/app/api/dashboard/stats/route.js`
    - Implement weekly trend computation: count active (non-expired, date_in ≤ day) items per day for last 7 days
    - Implement zone summary: item count and capacity percent per zone based on slots table
    - Implement expiry alerts: top 5 non-expired items sorted by ascending days-to-expiry
    - Implement quick stats: totalCategories, avgDaysToExpiry, expiredCount
    - Return JSON response matching the design interface
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 1.3 Update /api/profile route to handle avatar field
    - Modify GET handler to include `avatar` field in user response
    - Modify PUT handler to accept and persist `avatar` base64 string
    - Add validation: must start with `data:image/(png|jpeg|webp);base64,` and length ≤ 2,796,202 chars
    - Return appropriate error responses for invalid format or size
    - _Requirements: 8.3, 8.4, 8.5, 3.3_

  - [x] 1.4 Update /api/inventory route to handle image field
    - Modify PUT handler to accept optional `image` base64 string
    - Add validation: format must be JPEG/PNG/WebP, size ≤ 2MB
    - Return error response for invalid uploads
    - Modify GET handler to include `image` field in item response
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 2. Notification Context and shared state
  - [x] 2.1 Create NotificationContext provider
    - Create `src/lib/notifications.js` with React Context
    - Implement `notifications` array state, `unreadCount` computed value
    - Implement `markAsRead(id)`, `markAllAsRead()`, `addNotification(notif)` functions
    - Export `NotificationProvider` component and `useNotifications` hook
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Write property tests for NotificationContext logic
    - **Property 10: Notification unread count** — for any array of notifications, unreadCount equals count where isRead === false
    - **Property 11: Mark all as read sets count to zero** — after markAllAsRead(), all isRead === true and unreadCount === 0
    - **Property 12: Adding unread notification increments count** — adding isRead=false notification increments unreadCount by 1
    - **Property 13: Badge display formatting** — 0 shows nothing, 1-99 shows count string, >99 shows "99+"
    - **Validates: Requirements 4.1, 4.3, 4.4, 4.7**

  - [x] 2.3 Integrate NotificationProvider into dashboard layout
    - Wrap dashboard layout (`src/app/(dashboard)/layout.js`) with `NotificationProvider`
    - Update topbar bell icon to show dynamic badge from `useNotifications().unreadCount`
    - Implement badge formatting: hide at 0, show count 1-99, show "99+" above 99
    - Add dropdown that consumes notifications from context
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

- [x] 3. Checkpoint - Ensure foundation is solid
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Pagination on FIFO & Expiry page
  - [x] 4.1 Implement pagination logic in FIFO & Expiry page
    - Add `currentPage` state (1-indexed) and `PAGE_SIZE = 10` constant
    - Compute `totalPages` from filtered items length using `Math.ceil(filteredItems.length / 10)`
    - Use `useMemo` to compute paginated slice: `filteredItems.slice((currentPage-1)*10, currentPage*10)`
    - Reset `currentPage` to 1 when search/filter changes
    - _Requirements: 1.1, 1.2, 1.7_

  - [x] 4.2 Add pagination controls UI
    - Render page number buttons with active state styling
    - Implement Previous (<) and Next (>) buttons
    - Disable Previous on page 1, disable Next on last page
    - Show "Showing X to Y of Z entries" info text
    - Hide pagination controls when totalItems ≤ 10 or totalItems === 0
    - Show empty state message when filtered results are 0
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 1.9, 1.10_

  - [ ]* 4.3 Write property tests for pagination logic
    - **Property 1: Pagination slice correctness** — for any items array and valid page P, slice returns correct items from index (P-1)*10 to min(P*10, totalItems)-1
    - **Property 2: Filter resets pagination state** — any filter change resets to page 1 with correct totalPages
    - **Property 3: Pagination info string correctness** — X, Y, Z values satisfy X=(currentPage-1)*10+1, Y=min(currentPage*10, totalItems), Z=totalItems
    - **Validates: Requirements 1.2, 1.7, 1.8**

- [x] 5. Dashboard with charts and statistics
  - [x] 5.1 Implement dashboard page with recharts visualization
    - Install `recharts` dependency
    - Create WeeklyStockChart component using recharts LineChart
    - Fetch data from `/api/dashboard/stats` on mount
    - Render line chart with date on X-axis and item count on Y-axis
    - _Requirements: 2.1, 2.6_

  - [x] 5.2 Add zone summary cards and expiry alerts
    - Create ZoneSummaryCards component showing each zone's item count and capacity percent
    - Create ExpiryAlertList component showing top 5 nearest-expiry items with name, zone, daysLeft
    - Create quick stats section: totalCategories, avgDaysToExpiry, expiredCount
    - Add loading state and error state with retry button
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.7_

  - [ ]* 5.3 Write property tests for dashboard computations
    - **Property 4: Weekly stock trend computation** — produces exactly 7 data points with correct active item counts per day
    - **Property 5: Zone summary computation** — itemCount equals items in zone, capacityPercent = Math.round((itemCount/totalSlots)*100)
    - **Property 6: Expiry alerts top-N selection** — at most 5 items, all non-expired, sorted ascending by daysLeft, no excluded item has fewer days
    - **Property 7: Quick stats computation** — totalCategories = unique categories, expiredCount = items with "Expired" status, avgDaysToExpiry = mean of non-expired items
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [x] 6. Profile photo upload and audit trail display
  - [x] 6.1 Implement avatar upload in profile page
    - Add upload area in Account tab of `src/app/(dashboard)/settings/profile/page.js`
    - Show current avatar or initials placeholder (150x150 max)
    - Implement file selection with FileReader → base64 conversion
    - Client-side validation: file type (JPG, PNG, GIF) and size (≤ 2MB)
    - Show preview before save, send PUT to /api/profile with avatar field
    - Update localStorage user object with new avatar on success
    - Show success/error toast messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8_

  - [x] 6.2 Display avatar in audit trail entries
    - Modify `src/app/(dashboard)/settings/audit/page.js`
    - Show 32x32 avatar image next to actor name in each log entry
    - Show initials placeholder (first letter of name, capitalized) when avatar is null
    - Fetch user avatar data alongside audit entries
    - _Requirements: 3.6, 3.7_

  - [ ]* 6.3 Write property tests for image validation
    - **Property 8: Avatar storage round-trip** — valid base64 image saved and retrieved returns exact same string
    - **Property 9: Image upload validation rejects invalid input** — strings not matching data:image/(png|jpeg|gif|webp);base64,... or exceeding 2,796,202 chars are rejected
    - **Validates: Requirements 3.3, 3.4, 3.5, 8.4, 8.5**

- [x] 7. Checkpoint - Ensure core features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Inventory detail card modal
  - [x] 8.1 Implement inventory detail card modal
    - Add `selectedItem` state to inventory page (`src/app/(dashboard)/settings/inventory/page.js`)
    - On row click, set selectedItem and render modal overlay
    - Display all fields: image (300x300 max), name, category, qty, unit, location, dateIn, expiry, status
    - Show category-specific placeholder icon when no image uploaded
    - Close modal on outside click or close button, return focus to clicked row
    - _Requirements: 5.1, 5.2, 5.3, 5.7_

  - [x] 8.2 Add image upload to inventory detail card
    - Add upload button in detail card modal
    - Accept JPEG/PNG/WebP files ≤ 2MB only
    - Convert to base64 and PUT to /api/inventory
    - Replace placeholder with uploaded image on success
    - Show inline error for invalid files
    - _Requirements: 5.4, 5.5, 5.6_

  - [ ]* 8.3 Write property test for inventory detail card
    - **Property 14: Inventory detail card displays all required fields** — for any inventory item with all fields populated, rendered card contains name, category, qty, unit, location, dateIn, expiry, status
    - **Property 15: Inventory image storage round-trip** — valid base64 image saved to inventory item and retrieved returns exact same string
    - **Validates: Requirements 5.2, 5.5**

- [x] 9. Notifications page sync with context
  - [x] 9.1 Connect notifications page to NotificationContext
    - Update `src/app/(dashboard)/settings/notifications/page.js` to consume `useNotifications()`
    - Render notifications list from context state
    - Implement "Mark All as Read" button calling `markAllAsRead()`
    - Implement individual mark-as-read on notification click calling `markAsRead(id)`
    - Verify badge in topbar updates instantly when notifications are marked read
    - _Requirements: 4.3, 4.5, 4.6_

- [x] 10. Landing page and auth page branding
  - [x] 10.1 Implement landing page with AromaSys branding
    - Update `src/app/page.js` with AromaSys heading and description
    - Use `login_bg.png` as full-cover background image
    - Add "Sign In" button linking to /login and "Sign Up" button linking to /register
    - Write description in Indonesian, max 200 chars, mentioning 3+ features
    - Add redirect to /dashboard if user is already authenticated
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 10.2 Add text overlay to auth pages
    - Update `src/app/login/page.js` with tagline overlay on image panel
    - Update `src/app/register/page.js` with tagline overlay on image panel
    - Position text at bottom of image panel, above dark overlay layer
    - Style: font-size ≥ 48px, font-weight 600, contrast ratio ≥ 4.5:1 (use text-shadow or backdrop)
    - Tagline: 3-8 words in English, warehouse management themed
    - Hide image panel + overlay when viewport ≤ 1024px
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Final checkpoint - Ensure all features integrated
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The project uses JavaScript (Next.js 16 App Router + React 19) throughout
- recharts is the only new dependency to install
- All image storage uses base64 in PostgreSQL TEXT columns (no external storage)
- NotificationContext provides shared state between topbar and notifications page

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "2.2", "2.3"] },
    { "id": 2, "tasks": ["4.1", "5.1", "6.1", "10.1", "10.2"] },
    { "id": 3, "tasks": ["4.2", "5.2", "6.2", "9.1"] },
    { "id": 4, "tasks": ["4.3", "5.3", "6.3", "8.1"] },
    { "id": 5, "tasks": ["8.2"] },
    { "id": 6, "tasks": ["8.3"] }
  ]
}
```
