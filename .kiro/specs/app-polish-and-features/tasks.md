# Implementation Plan: App Polish and Features

## Overview

This plan implements a comprehensive polish pass across the AromaSys WMS application. Work is organized into parallel streams: UI cleanup (tab removal, sidebar logo), new features (floor plan upload, profile page), layout/spacing fixes, and production-readiness improvements. Tasks are structured for maximum parallel execution — independent file changes run concurrently while dependent tasks are sequenced.

## Tasks

- [ ] 1. Floor Plan Page Cleanup and Upload Feature
  - [x] 1.1 Remove Digital Twin navigation tabs from Floor Plan page
    - Remove the `digital-twin-tabs` div and its child `<Link>` elements from `src/app/(dashboard)/digital-twin/floor-plan/page.js`
    - Remove associated CSS rules for `.digital-twin-tabs` and `.dt-tab` from `src/app/(dashboard)/digital-twin/floor-plan/floor-plan.css`
    - Verify the page renders cleanly without the tab navigation
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Create Floor Plan Upload API route
    - Create `src/app/api/floor-plan-upload/route.js` with POST handler
    - Implement multipart form data parsing for `image` and `pdf` fields
    - Add file size validation (10MB limit) and format validation (PNG, JPG, WEBP for images; PDF for metadata)
    - Implement Gemini AI integration for zone extraction from PDF using `GEMINI_API_KEY` env variable
    - Return appropriate error responses (400 for validation, 500 for server errors)
    - _Requirements: 2.2, 2.3, 2.6, 2.7, 2.8_

  - [-] 1.3 Create Floor Plan Upload UI page
    - Create `src/app/(dashboard)/digital-twin/floor-plan/upload/page.js` as a client component
    - Create `src/app/(dashboard)/digital-twin/floor-plan/upload/upload.css` with styles
    - Implement drag-and-drop and file picker for image files (PNG, JPG, WEBP)
    - Implement PDF file picker for floor plan metadata
    - Add client-side validation (file size > 10MB error, unsupported format error)
    - Show upload progress and success/error states
    - Store uploaded image and extracted zones in localStorage under key `aromasys_floor_plan`
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8_

  - [~] 1.4 Integrate uploaded floor plan image rendering with hotspots
    - Modify `src/app/(dashboard)/digital-twin/floor-plan/page.js` to check localStorage for uploaded floor plan
    - Add an "Upload Floor Plan" button in the page header area
    - When a custom image exists, render it as background with zone hotspot overlays at extracted positions
    - Fall back to the existing grid-based ROOMS layout when no custom image is uploaded
    - _Requirements: 2.4, 2.5_

- [ ] 2. Profile Page and API
  - [x] 2.1 Create Profile API route
    - Create `src/app/api/profile/route.js` with GET and PUT handlers
    - GET: Query user by `userId` param, return `{ success, user: { id, name, email, role } }`
    - PUT (profile update): Update `name` and `email` in `users` table
    - PUT (password change): Validate current password, update to new password
    - Return 404 for user not found, 400 for incorrect current password, 500 for server errors
    - _Requirements: 5.7, 6.2, 6.3_

  - [-] 2.2 Create Profile Page UI
    - Create `src/app/(dashboard)/settings/profile/page.js` as a client component
    - Create `src/app/(dashboard)/settings/profile/profile.css` with styles
    - Implement tabbed interface: Account, Password, Notifications
    - Account tab: Display avatar, name, email, role; editable name and email fields with save
    - Password tab: Current password, new password, confirm password fields with validation
    - Notifications tab: Toggle switches for email and in-app notification preferences
    - Support `?tab=password` query param to open password tab directly
    - Show success toast on save, validation errors for mismatched passwords
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8, 5.9_

  - [-] 2.3 Add Profile link to Sidebar navigation
    - Add a "Profile" menu item under the SETTINGS group in `src/components/Sidebar.js` with route `/settings/profile` and `User` icon
    - _Requirements: 6.1_

- [x] 3. Sidebar Logo Figma Match
  - [x] 3.1 Update Sidebar logo section to match Figma design
    - Modify `src/components/Sidebar.js` logo section to match Figma file key `T5U7kGTIeNrVnykNSRmKHv`
    - Update the monogram, application name, and tagline elements
    - Update `src/components/Sidebar.css` with correct typography, colors, and dimensions from Figma
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. Layout and Spacing Fixes
  - [x] 4.1 Update global spacing tokens and base layout styles
    - In `src/app/globals.css`, ensure `.page-header` has `margin-bottom: var(--space-6)` (24px minimum)
    - Add `.card { max-width: 100%; overflow: hidden; }` to prevent card overflow
    - Add `.content-area { overflow-x: hidden; }` for content containment
    - Add responsive grid reflow rules for viewports < 1280px
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [-] 4.2 Fix report page card overflow
    - In `src/app/(dashboard)/copilot/report/report.css`, constrain all card and panel elements within content area bounds
    - Ensure no horizontal overflow on the report page
    - _Requirements: 3.4_

  - [-] 4.3 Audit and fix spacing across all dashboard page CSS files
    - Review and fix spacing in `src/app/(dashboard)/dashboard/dashboard.css`
    - Review and fix spacing in `src/app/(dashboard)/copilot/chat/chat.css`
    - Review and fix spacing in `src/app/(dashboard)/copilot/upload/upload.css`
    - Review and fix spacing in `src/app/(dashboard)/digital-twin/cold-chain/cold-chain.css`
    - Review and fix spacing in `src/app/(dashboard)/digital-twin/fifo-expiry/fifo-expiry.css`
    - Review and fix spacing in `src/app/(dashboard)/settings/audit/audit.css`
    - Review and fix spacing in `src/app/(dashboard)/settings/inventory/inventory.css`
    - Ensure minimum 16px (var(--space-4)) between adjacent content blocks and consistent vertical spacing using design tokens
    - _Requirements: 3.3, 3.5_

- [~] 5. Checkpoint - Verify layout and spacing
  - Ensure all pages render without overflow, verify spacing consistency, ask the user if questions arise.

- [ ] 6. Production-Ready and UI/UX Improvements
  - [~] 6.1 Implement topbar search functionality
    - In `src/app/(dashboard)/layout.js`, make the search input functional by filtering sidebar navigation items or displaying a "Search coming soon" placeholder badge
    - _Requirements: 6.4_

  - [~] 6.2 Add client-side form validation across all forms
    - Add required field checks, email format validation, and numeric range validation to inventory forms in `src/app/(dashboard)/settings/inventory/page.js`
    - Ensure all form submissions validate before sending API requests
    - _Requirements: 6.6_

  - [~] 6.3 Add error handling and loading states to all pages
    - Wrap all `fetch()` calls in try/catch with user-friendly error messages for database connection failures
    - Add loading spinners/skeletons to pages that fetch data (dashboard, inventory, audit, cold-chain, fifo-expiry)
    - Ensure API routes return appropriate HTTP status codes (200, 400, 404, 500)
    - _Requirements: 6.2, 6.5, 7.6_

  - [~] 6.4 Apply consistent UI polish across all pages
    - Ensure consistent `border-radius` using design tokens (var(--radius-sm) through var(--radius-xl))
    - Apply hover and focus states to all interactive elements using transition tokens
    - Ensure consistent typography scale usage across all pages
    - Verify all interactive elements have minimum 44x44px touch targets
    - Ensure color contrast meets 4.5:1 ratio for normal text
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8_

- [~] 7. Final Checkpoint - Full verification
  - Ensure all tests pass, verify all navigation links resolve to functional pages, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The floor plan upload stores images client-side (localStorage) — no new database tables needed
- The profile page uses the existing `users` table — no schema changes required
- Sidebar logo update requires referencing Figma file key `T5U7kGTIeNrVnykNSRmKHv` for exact branding

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "2.1", "3.1", "4.1"] },
    { "id": 1, "tasks": ["1.3", "2.2", "2.3", "4.2", "4.3"] },
    { "id": 2, "tasks": ["1.4", "6.1", "6.2"] },
    { "id": 3, "tasks": ["6.3", "6.4"] }
  ]
}
```
