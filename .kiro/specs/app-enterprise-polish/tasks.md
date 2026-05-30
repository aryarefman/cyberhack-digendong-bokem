# Implementation Plan: App Enterprise Polish

## Overview

Enterprise polish for the AromaSys (SIMA AROME) warehouse management system covering branding, UI fixes, role management, notification persistence, dashboard improvements, floor plan interactions, cold chain filtering, data ingestion UX, auto-report capabilities, audit trail enhancements, admin profile sync, AI pipeline upgrades, AI QC module, and enterprise readiness patterns. Implementation uses TypeScript (Next.js 16 + React 19 + Tailwind CSS) frontend and JavaScript (Express 5 + PostgreSQL) backend.

## Tasks

- [x] 1. Quick fixes: Logo, Toast, Back Button, Role, Notification Fix
  - [x] 1.1 Replace logo across all pages
    - Update Sidebar component to use `/logo-aromasys-new.png`
    - Update Login page to use `/logo-aromasys-new.png`
    - Update Register page to use `/logo-aromasys-new.png`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Implement global toast notification system
    - Create `frontend/src/components/ToastContainer.tsx` with fixed bottom-right positioning (`z-[9999]`)
    - Create Toast context provider with `addToast` and `removeToast` functions
    - Support toast types: success, error, info, warning with auto-dismiss (4s default)
    - Add Framer Motion exit animations
    - Wrap app layout with ToastProvider
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.3 Fix auth back button navigation
    - Replace `router.back()` with `router.push('/')` on Login page back button
    - Replace `router.back()` with `router.push('/')` on Register page back button
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 1.4 Add PPIC role support
    - Add `'PPIC'` to allowed roles in backend auth routes (register/edit)
    - Add `{ value: 'PPIC', label: 'Production Planner (PPIC)' }` to frontend role selection dropdowns
    - Update `requireRole` middleware to include PPIC for inventory and production planning routes
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 1.5 Implement notification persistence backend
    - Create `notification_reads` table (user_id, notification_id, read_at, UNIQUE constraint)
    - Create `backend/src/routes/notifications.js` with GET read-state, POST mark-read, POST mark-all-read endpoints
    - Register routes in server.js with auth middleware
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 1.6 Connect notification frontend to persistence API
    - Replace localStorage read-state logic with API calls in notification component
    - Fetch read state on mount from `/api/notifications/read-state`
    - POST to `/api/notifications/mark-read` and `/api/notifications/mark-all-read` on user actions
    - Use optimistic UI updates
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 2. Checkpoint - Quick fixes complete
  - Ensure all quick fixes compile and render correctly, ask the user if questions arise.

- [x] 3. Dashboard and UI improvements
  - [x] 3.1 Add zone capacity color indicators to dashboard
    - Create utility functions `getCapacityColor(utilization)` and `calculateUtilization(occupied, total)`
    - Apply color-coded indicators (green <50%, yellow 50-80%, red >80%) to zone cards on dashboard
    - Ensure dynamic updates when capacity data changes
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 4. Floor plan fixes
  - [x] 4.1 Fix floor plan upload card layout
    - Remove `overflow-hidden` from modal container
    - Set modal width to `max-w-2xl` with proper backdrop (`fixed inset-0 bg-black/50 z-[9998]`)
    - Arrange image and PDF drop zones side-by-side with `flex flex-row gap-4`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 4.2 Implement zone drag, resize, and detail icon interactions
    - Add arrow icon overlay (Lucide `ArrowUpRight`) on each zone for detail access
    - Zone body `onMouseDown` initiates drag (does NOT open details)
    - Arrow icon `onClick` (with `stopPropagation`) opens zone details modal
    - Add resize handles on edges/corners using existing `calculateResize*` functions from `@/lib/zones.ts`
    - Enforce minimum size (5% width, 5% height) and canvas boundary clamping
    - Persist updated positions/dimensions to localStorage after each operation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 5. Cold chain filter
  - [x] 5.1 Add zone filter to cold chain page
    - Add horizontal button group with "All Zones", "A", "B", "C", "D", "E" filter buttons
    - Implement `activeZone` state and filter logic on temperature data
    - Style active button with filled background, inactive with outline
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 6. Data ingestion improvements
  - [x] 6.1 Add delete button and spinner to ingestion history
    - Add Lucide `Trash2` delete button to each history row
    - Implement delete handler that removes record from localStorage history array
    - Replace generic loading animation with circular spinner component during file processing
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 6.2 Move action column to first position in extraction table
    - Reorder columns array to place action column at index 0
    - Apply `sticky left-0 z-10 bg-white` to action column cells for scroll persistence
    - _Requirements: 11.1, 11.2_

- [x] 7. Checkpoint - UI improvements complete
  - Ensure dashboard, floor plan, cold chain, and data ingestion changes compile and render correctly, ask the user if questions arise.

- [x] 8. Auto-report enhancements
  - [x] 8.1 Enhance auto-report content and export
    - Add detailed report sections: inventory status, zone utilization, expiry alerts, trend analysis
    - Add custom notes `<textarea>` field bound to report state
    - Implement PDF export with headers, sections, charts, and custom notes included
    - Implement Excel export with tabular data only (no custom notes, no formatting)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 9. Audit trail and admin sync
  - [x] 9.1 Add profile photos to audit trail
    - Modify backend `/api/audit` query to JOIN users table for avatar data
    - Add optional `user_id` column to audit_logs table (ALTER TABLE)
    - Create `AuditAvatar` component with image display or initials fallback (`getInitials` helper)
    - Render avatar beside each audit log entry
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 9.2 Implement admin profile sync
    - Create `PUT /api/profile/admin-edit` endpoint (admin-only, updates target user record)
    - Create audit log entry with admin as actor and employee as target
    - Connect frontend admin user management to new endpoint
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 10. AI pipeline upgrade
  - [x] 10.1 Refactor AI pipeline with multi-model fallback
    - Refactor `frontend/src/lib/gemini.ts` to support `AITaskType` and `ModelConfig`
    - Implement ordered fallback chain per task type (floor-plan, ocr, chatbot, qc)
    - Add `callAI(prompt, taskType, imageBase64?, mimeType?)` function with sequential model attempts
    - Update all existing AI call sites to use new `callAI` interface
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 11. AI QC module (new feature)
  - [x] 11.1 Create QC database table and backend routes
    - Create `qc_inspections` table (material_id, material_type, result, confidence, notes, image, inspected_by, inspected_at)
    - Create `backend/src/routes/qc.js` with POST `/api/qc/inspect` and GET `/api/qc/history`
    - Register routes in server.js with auth middleware
    - Create audit trail entry on each inspection
    - _Requirements: 16.4, 16.6_

  - [x] 11.2 Create QC frontend page with camera and inspection panels
    - Create `frontend/src/app/(dashboard)/qc/page.tsx`
    - Implement `QCInspectionPanel` with tabs for Fruit/Raw-Material and Extract/Powder
    - Implement `CameraCapture` component using `navigator.mediaDevices.getUserMedia()`
    - Implement `QCResultDisplay` showing pass/fail badge, confidence %, defect notes
    - Wire camera capture → AI pipeline (taskType: 'qc') → display results → save to backend
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 12. Checkpoint - Features complete
  - Ensure auto-report, audit trail, admin sync, AI pipeline, and QC module compile and function correctly, ask the user if questions arise.

- [x] 13. Enterprise readiness
  - [x] 13.1 Add input validation middleware
    - Create `backend/src/middleware/validate.js` using express-validator
    - Apply validation rules to auth endpoints (login, register)
    - Apply validation rules to profile, notifications, and QC endpoints
    - Return structured 400 errors with `VALIDATION_ERROR` code
    - _Requirements: 17.1_

  - [x] 13.2 Add rate limiting to auth endpoints
    - Install `express-rate-limit` package
    - Create `backend/src/middleware/rateLimit.js` with auth limiter (10 req / 15 min)
    - Apply to POST `/api/auth/login` and POST `/api/auth/register`
    - Return 429 with `RATE_LIMITED` code
    - _Requirements: 17.2_

  - [x] 13.3 Implement structured error responses and correlation IDs
    - Create `backend/src/middleware/correlationId.js` (generate/propagate UUID, set response header)
    - Create global error handler middleware with consistent `{ success, error, code, correlationId }` format
    - Apply correlation ID middleware to all routes
    - Add structured JSON request logging
    - _Requirements: 17.3, 17.7_

  - [x] 13.4 Implement frontend retry with exponential backoff
    - Create `frontend/src/lib/api.ts` with `fetchWithRetry(url, options, maxRetries)` function
    - Implement exponential backoff (1s, 2s, 4s) for 5xx errors
    - Update critical API calls to use `fetchWithRetry`
    - _Requirements: 17.4_

  - [x] 13.5 Increase connection pool and add JWT refresh
    - Update `backend/src/lib/db.js` pool `max` from 5 to 20, add health check query
    - Create POST `/api/auth/refresh` endpoint that issues new token with extended expiry
    - Add frontend 401 interceptor: attempt refresh → retry original request
    - _Requirements: 17.5, 17.6_

  - [x] 13.6 Implement graceful AI degradation
    - Add fallback UI states when AI services are unavailable:
      - Chatbot: "AI temporarily unavailable" message
      - QC module: manual inspection form fallback
      - OCR/data ingestion: manual entry form
      - Floor plan: upload-only mode without AI suggestions
    - Ensure core warehouse operations (inventory, FIFO, cold chain) continue unaffected
    - _Requirements: 17.8_

- [x] 14. Final checkpoint - Enterprise readiness complete
  - Ensure all middleware, rate limiting, error handling, retry logic, and AI degradation work correctly, ask the user if questions arise.

## Notes

- All tasks reference specific requirements for traceability
- Checkpoints ensure incremental validation between logical groups
- The project uses TypeScript (Next.js 16 + React 19) frontend and JavaScript (Express 5) backend
- AI capabilities use Google Gemini with configurable fallback chain
- No property-based tests included per user request for faster delivery
- Database migrations should be run via the existing `backend/scripts/init-db.js` pattern

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.2", "1.5", "3.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["1.6", "4.2", "6.1", "6.2"] },
    { "id": 3, "tasks": ["8.1", "9.1", "9.2"] },
    { "id": 4, "tasks": ["10.1"] },
    { "id": 5, "tasks": ["11.1"] },
    { "id": 6, "tasks": ["11.2"] },
    { "id": 7, "tasks": ["13.1", "13.2", "13.3", "13.4"] },
    { "id": 8, "tasks": ["13.5", "13.6"] }
  ]
}
```
