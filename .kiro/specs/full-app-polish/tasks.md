# Implementation Plan: Full App Polish

## Overview

This plan implements the full application polish for AromaSys (SIMA AROME), covering dashboard alignment with Hikari design, floor plan AI analysis and editability, OCR data ingestion, chatbot navbar integration, UI consistency, and ensuring all interactive elements are functional. Tasks are ordered by dependency — shared utilities and interfaces first, then core features, then integration and wiring.

## Tasks

- [x] 1. Set up shared utilities and interfaces
  - [x] 1.1 Create Gemini AI direct call utility
    - Create `frontend/src/lib/gemini.ts` with the `callGemini` function for direct frontend-to-Gemini calls
    - Include model fallback chain (gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash)
    - Use `NEXT_PUBLIC_GEMINI_API_KEY` environment variable
    - _Requirements: 11.2, 11.3, 11.5_

  - [x] 1.2 Create zone management utility and types
    - Create `frontend/src/lib/zones.ts` with `InteractiveZone`, `ZonePosition`, `Material` interfaces
    - Implement `calculateDragPosition`, `calculateResizeRight`, `calculateResizeLeft`, `calculateResizeTop`, `calculateResizeBottom` functions
    - Implement `detectZoneMismatch` with `CATEGORY_ZONE_MAP`
    - Define `STORAGE_KEYS` constants for localStorage keys
    - _Requirements: 4.1, 4.2, 5.4_

  - [x] 1.3 Create OCR data types and utilities
    - Create `frontend/src/lib/ocr.ts` with `OcrItem`, `UploadRecord` interfaces
    - Implement duplicate detection function (case-insensitive name + lot number match)
    - Implement upload record creation helper
    - _Requirements: 6.2, 7.1, 6.8_

- [x] 2. Implement Dashboard page matching Hikari design
  - [x] 2.1 Build Dashboard page layout with stat cards and charts
    - Rewrite `frontend/src/app/(dashboard)/overview/page.tsx` to match `hikari_dashboard.txt`
    - Implement StatCards grid (Total Active Stock, Nearing Expiry, Warehouse Capacity, Cold-Chain Alerts)
    - Implement WeeklyStockChart using Recharts LineChart with ResponsiveContainer
    - Implement ZoneSummaryCards with color-coded capacity indicators (green < 70%, amber 70-90%, red > 90%)
    - Implement ExpiryAlertsPanel and ActivityTimeline
    - Fetch live data from `/api/dashboard/stats` on page load
    - Apply Poppins font, #2C742F primary, #D7E5D8 background, #1C1B1F text
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property test for Zone Summary Card data integrity
    - **Property 1: Zone Summary Card Data Integrity**
    - **Validates: Requirements 1.4**

- [x] 3. Fix Authentication page UI
  - [x] 3.1 Fix back arrow centering on login and register pages
    - Update `frontend/src/app/(auth)/login/page.tsx` to center back arrow with flexbox (`items-center justify-center`)
    - Update `frontend/src/app/(auth)/register/page.tsx` with same centering fix
    - Ensure alignment is consistent across viewport sizes (320px to 1920px)
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Implement Floor Plan AI image analysis
  - [x] 4.1 Build floor plan upload and AI zone detection
    - Update `frontend/src/app/(dashboard)/floor-plan/page.tsx` to match `hikari_floor_plan.txt`
    - Implement UploadPanel with dual drop-zone (image + optional PDF)
    - On image-only upload: call Gemini directly from frontend for zone detection
    - On image+PDF upload: send to backend `/api/floor-plan-upload` endpoint
    - Parse Gemini response into InteractiveZone array with percentage-based positions
    - Display uploaded image as canvas background
    - Show error message with retry on AI failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 11.1, 11.3_

  - [ ]* 4.2 Write property test for AI zone detection output validity
    - **Property 2: AI Zone Detection Output Validity**
    - **Validates: Requirements 3.2, 3.6**

  - [x] 4.3 Implement backend floor plan upload route
    - Update `backend/src/routes/floor-plan-upload.js` with Multer memory storage (10MB limit)
    - Accept `image` (PNG/JPG/WEBP) and `pdf` (application/pdf) fields
    - Send PDF buffer as base64 to Gemini for enhanced zone extraction
    - Return `{ success: boolean, zones: ZoneDetection[] }` response
    - _Requirements: 11.1, 11.4, 3.4_

- [x] 5. Implement Floor Plan editability
  - [x] 5.1 Implement zone drag and resize interactions
    - Build InteractiveZone component with drag handlers (mousedown/mousemove/mouseup)
    - Implement edge handles for resize (top, right, bottom, left)
    - Use percentage-based coordinate system relative to canvas container
    - Clamp positions so zones never exceed canvas boundaries
    - Enforce minimum 5% width and 5% height on resize
    - Persist updated positions to localStorage on drag/resize end
    - _Requirements: 4.1, 4.2, 4.7_

  - [ ]* 5.2 Write property test for zone drag position clamping
    - **Property 3: Zone Drag Position Clamping**
    - **Validates: Requirements 4.1**

  - [ ]* 5.3 Write property test for zone resize minimum size invariant
    - **Property 4: Zone Resize Minimum Size Invariant**
    - **Validates: Requirements 4.2**

  - [x] 5.4 Implement zone CRUD operations (add, edit, delete)
    - Implement "Add Zone" button creating new zone with default position, open ZoneDetailsModal
    - Build ZoneDetailsModal matching `hikari_zone_modal.txt` for editing name, sensors, materials
    - Implement zone deletion with confirmation
    - Enforce maximum 30 zones limit
    - Persist all changes to localStorage under `aromasys_interactive_zones`
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 5.5 Write property test for zone localStorage round-trip
    - **Property 5: Zone Configuration localStorage Round-Trip**
    - **Validates: Requirements 4.4, 4.7**

  - [ ]* 5.6 Write property test for zone deletion correctness
    - **Property 6: Zone Deletion Correctness**
    - **Validates: Requirements 4.5**

  - [ ]* 5.7 Write property test for zone count maximum invariant
    - **Property 7: Zone Count Maximum Invariant**
    - **Validates: Requirements 4.6**

- [x] 6. Checkpoint - Ensure floor plan features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Dynamic AI Recommendations
  - [x] 7.1 Build AI recommendation panel for floor plan
    - Implement AIRecommendationPanel component
    - On empty slot selection: generate recommendation based on latest inventory item + zone classification
    - Recalculate recommendations when inventory changes
    - Implement "Apply Recommendation" action that writes placement to backend API
    - Display ZoneMismatchWarning when item category doesn't match zone classification
    - Regenerate recommendations when floor plan layout changes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Write property test for zone-category mismatch detection
    - **Property 8: Zone-Category Mismatch Detection**
    - **Validates: Requirements 5.4**

- [x] 8. Implement Data Ingestion OCR functionality
  - [x] 8.1 Build data ingestion page with OCR extraction
    - Rewrite `frontend/src/app/(dashboard)/data-ingestion/page.tsx` to match `hikari_upload.txt`
    - Implement FileUploadZone with drag-and-drop (JPG, PNG, PDF)
    - On file upload: send to Gemini directly with OCR extraction prompt
    - Display results in OcrResultsTable with editable columns (name, category, qty, unit, lot, location, expiry, confidence)
    - Support multiple file uploads accumulating results
    - Show descriptive error on AI failure with retry option
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7, 11.3_

  - [ ]* 8.2 Write property test for OCR item edit state update
    - **Property 9: OCR Item Edit State Update**
    - **Validates: Requirements 6.4**

  - [ ]* 8.3 Write property test for multi-file OCR result accumulation
    - **Property 10: Multi-File OCR Result Accumulation**
    - **Validates: Requirements 6.7, 7.4**

  - [x] 8.4 Implement save to inventory and ingestion history
    - Implement "Save All to Inventory" button posting each item to backend `/api/inventory`
    - Assign zone based on category using CATEGORY_ZONE_MAP
    - Log upload record to ingestion history (localStorage)
    - Display IngestionHistory table with past uploads
    - Implement row editing and inline state updates
    - _Requirements: 6.4, 6.5, 6.8_

  - [ ]* 8.5 Write property test for upload history record completeness
    - **Property 11: Upload History Record Completeness**
    - **Validates: Requirements 6.8**

- [x] 9. Implement duplicate detection and row management
  - [x] 9.1 Build duplicate detection and row operations
    - Check each extracted item against existing inventory via backend API (name + lot number match)
    - Display DuplicateWarningIndicator on affected rows with matching item details
    - Implement row deletion for individual extracted items
    - Process multiple files sequentially, merging into single extraction table
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 9.2 Write property test for duplicate detection by name and lot number
    - **Property 12: Duplicate Detection by Name and Lot Number**
    - **Validates: Requirements 7.1**

  - [ ]* 9.3 Write property test for OCR row deletion correctness
    - **Property 13: OCR Row Deletion Correctness**
    - **Validates: Requirements 7.3**

- [x] 10. Checkpoint - Ensure data ingestion features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement Chatbot via Navbar
  - [x] 11.1 Build chatbot overlay with navbar trigger
    - Add Bot icon button to top navigation bar (remove any floating button)
    - Build ChatbotOverlay as right-side slide-in panel with Framer Motion spring animation
    - Implement MessageList with user/AI message bubbles
    - Implement QuickPresets horizontal scrollable buttons for common queries
    - Implement InputBar with send button, disabled during loading
    - On send: call Gemini directly from frontend, display response
    - Maintain conversation history within session
    - Match styling from `hikari_notifications.txt` patterns
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 11.2_

  - [ ]* 11.2 Write property test for chat conversation history ordering
    - **Property 14: Chat Conversation History Ordering**
    - **Validates: Requirements 8.5**

- [x] 12. Apply UI consistency across all pages
  - [x] 12.1 Apply Hikari design system across all pages
    - Ensure color palette consistency: primary #2C742F, background #D7E5D8, accent #AAE970, text #1C1B1F, secondary #79747E
    - Apply Tailwind for layout/spacing, CSS modules for complex component styling
    - Add Framer Motion page transitions and modal animations
    - Update sidebar navigation to match Hikari grouped layout (MAIN, WAREHOUSE, PRODUCTION, SETTINGS)
    - Ensure responsive layouts from 320px to 1920px
    - Port any features from Hikari branch not yet in frontend branch
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 13. Ensure all buttons and features are functional
  - [x] 13.1 Wire all interactive elements to their actions
    - Verify all sidebar navigation links route correctly
    - Wire all action buttons (Add, Edit, Delete, Save, Export) to backend CRUD operations
    - Ensure form inputs update state and validate according to constraints
    - Display user-friendly error messages on API failures with retry option
    - Implement optimistic updates or confirmation-based UI updates
    - Disable buttons during async operations (loading state)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 13.2 Write property test for form input validation correctness
    - **Property 15: Form Input Validation Correctness**
    - **Validates: Requirements 10.3**

  - [ ]* 13.3 Write property test for async button disable invariant
    - **Property 16: Async Button Disable Invariant**
    - **Validates: Requirements 10.6**

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Reference `frontend/hikari_*.txt` files for target UI implementation during each page rewrite
- The Gemini utility (task 1.1) is shared across floor plan, data ingestion, and chatbot features
- Zone management utility (task 1.2) is shared across floor plan editability and AI recommendations
- All localStorage keys use the `aromasys_` prefix for namespace isolation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "3.1"] },
    { "id": 1, "tasks": ["2.1", "4.1", "4.3"] },
    { "id": 2, "tasks": ["2.2", "4.2", "5.1", "5.4"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.5", "5.6", "5.7", "7.1"] },
    { "id": 4, "tasks": ["7.2", "8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 6, "tasks": ["8.5", "9.1"] },
    { "id": 7, "tasks": ["9.2", "9.3", "11.1"] },
    { "id": 8, "tasks": ["11.2", "12.1"] },
    { "id": 9, "tasks": ["13.1"] },
    { "id": 10, "tasks": ["13.2", "13.3"] }
  ]
}
```
