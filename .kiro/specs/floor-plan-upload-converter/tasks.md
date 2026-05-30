# Implementation Plan: Floor Plan Upload Converter

## Overview

This implementation adds a floor plan upload and AI-powered conversion feature to the existing Interactive Floor Plan page. Users (QC/Admin) can upload a warehouse floor plan image or PDF, have it analyzed by Gemini API, preview and adjust the extracted layout, then confirm and persist it to the PostgreSQL database. The feature is implemented as a modal workflow within the existing floor plan page, reusing the project's Gemini API integration, auth context, and database patterns.

## Tasks

- [ ] 1. Create utility modules and validation logic
  - [ ] 1.1 Create file validation utility at `src/lib/floor-plan-utils.js`
    - Implement `validateFile(file)` function that checks MIME type (image/jpeg, image/png, application/pdf) and file size (1 KB min, 10 MB max)
    - Return `{ valid: boolean, error?: string }` result object
    - Implement `getZoneTypeColor(zoneType)` function mapping zone types to color pairs: cold-storage → (`#D6EAF8`, `#2980B9`), hazardous → (`#FADBD8`, `#E74C3C`), general → (`#D5F5E3`, `#27AE60`), empty → (`#F2F3F4`, `#BDC3C7`), loading-dock → (`#FEF9E7`, `#F39C12`)
    - Implement `isAuthorizedForUpload(role)` function returning true only for "QC" or "Admin" roles
    - Implement `validateSlotId(id)` function checking format matches `^[A-E]-[1-6]$`
    - _Requirements: 1.1, 1.2, 1.3, 3.2, 5.1, 6.1_

  - [ ] 1.2 Create Gemini response parser at `src/lib/floor-plan-parser.js`
    - Implement `parseGeminiResponse(responseText)` that parses JSON and validates against GeminiFloorPlanResponse schema
    - Return `{ success: true, layout: FloorPlanLayout }` or `{ success: false, error: string }`
    - Handle invalid JSON, missing fields, invalid zone types, and duplicate slot IDs (deduplicate by keeping first occurrence)
    - Validate all slot IDs match the `{letter}-{number}` format
    - Validate zone IDs are single uppercase letters A-E
    - _Requirements: 2.4, 2.5, 2.6_

  - [ ] 1.3 Create layout-to-database transformation utility in `src/lib/floor-plan-utils.js`
    - Implement `layoutToDbRows(layout)` that converts a FloorPlanLayout into an array of slot row objects with fields: id, zone, row, col, occupied (false for new slots)
    - Each row's `row` field is the first character of the slot ID, `col` is the number portion
    - _Requirements: 4.2, 5.1, 5.2_

  - [ ]* 1.4 Write property tests for file validation (Property 1)
    - **Property 1: File validation correctly accepts and rejects files**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - Use `fast-check` to generate arbitrary MIME types and file sizes, assert acceptance iff type is jpeg/png/pdf AND size is 1KB–10MB

  - [ ]* 1.5 Write property tests for Gemini response parser (Properties 2, 3)
    - **Property 2: Gemini response parsing produces valid layout**
    - **Property 3: Malformed responses are handled gracefully**
    - **Validates: Requirements 2.4, 2.5**
    - Generate valid GeminiFloorPlanResponse JSON objects and verify parser output matches input counts
    - Generate arbitrary non-JSON strings and malformed JSON, verify parser returns error result without throwing

  - [ ]* 1.6 Write property tests for zone color mapping and slot ID validation (Properties 4, 5)
    - **Property 4: Zone type to color mapping is consistent**
    - **Property 5: Slot IDs follow the correct format**
    - **Validates: Requirements 3.2, 3.3, 5.1**
    - For all valid ZoneType values, verify correct color pair returned
    - For generated slot objects, verify ID matches `^[A-E]-[1-6]$` and equals `row + '-' + col`

  - [ ]* 1.7 Write property tests for layout-to-DB transformation and authorization (Properties 6, 8)
    - **Property 6: Layout to database transformation preserves all slots with valid data**
    - **Property 8: Authorization restricts access to QC and Admin roles only**
    - **Validates: Requirements 4.2, 5.2, 6.1**
    - For any valid FloorPlanLayout, verify transformation produces one row per slot with correct fields
    - For arbitrary role strings, verify authorization returns true only for "QC" and "Admin"

- [ ] 2. Implement the API route for floor plan layout persistence
  - [ ] 2.1 Create API route at `src/app/api/floor-plan-layout/route.js`
    - Implement GET handler: query `slots` table to check if any layout exists, return `{ exists: boolean, slotCount: number }`
    - Implement POST handler: accept `SaveLayoutPayload` body, validate user role is QC/Admin (return 403 otherwise)
    - POST logic: begin transaction, if `replaceExisting` is true delete existing slots (preserving inventory items for matching slot IDs), insert new slot rows, re-link preserved inventory items, commit transaction
    - Log the layout save action to `audit_logs` table
    - _Requirements: 4.1, 4.2, 5.4, 6.3_

  - [ ]* 2.2 Write unit tests for floor-plan-layout API route
    - Test GET returns correct exists/slotCount
    - Test POST with unauthorized role returns 403
    - Test POST with valid payload creates slots
    - Test POST with replaceExisting preserves matching inventory items
    - _Requirements: 4.1, 4.2, 5.4, 6.3_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Build the Upload Converter modal UI components
  - [ ] 4.1 Create UploadStep component at `src/components/floor-plan-upload/UploadStep.js`
    - Implement drag-and-drop zone with `onDragOver`, `onDragLeave`, `onDrop` handlers
    - Implement file picker button using hidden file input
    - Call `validateFile()` on file selection; display error toast for invalid files
    - On valid file: display file name, file size, and thumbnail preview (for images) or file icon (for PDFs)
    - Create corresponding `UploadStep.css` with styles matching existing upload page patterns
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 4.2 Create PreviewStep component at `src/components/floor-plan-upload/PreviewStep.js`
    - Render the AI-generated layout using CSS grid matching the existing floor plan visual system
    - Color-code zones using `getZoneTypeColor()` utility
    - Display slot labels in monospace font using `{row_letter}-{column_number}` format
    - Implement zone click → dropdown to change zone type
    - Implement slot click → inline editor to change slot label
    - Add "Add Zone" and "Remove Zone" buttons
    - Display summary showing total zones and slots count
    - Create corresponding `PreviewStep.css`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ] 4.3 Create ConfirmStep component at `src/components/floor-plan-upload/ConfirmStep.js`
    - Display final layout summary before saving
    - Show replacement warning if existing layout detected (fetched via GET `/api/floor-plan-layout`)
    - Implement confirm button that calls POST `/api/floor-plan-layout` with the layout payload
    - Show saving indicator and disable confirm button during save
    - On success: display success notification and redirect to `/digital-twin/floor-plan`
    - _Requirements: 4.1, 4.3, 4.4, 4.5_

  - [ ] 4.4 Create UploadConverterModal component at `src/components/floor-plan-upload/UploadConverterModal.js`
    - Implement 3-step modal workflow: Upload → Preview & Adjust → Confirm & Save
    - Manage step state and transitions between steps
    - Integrate Gemini API call: convert file to base64, send to Gemini with floor plan analysis prompt from design doc
    - Show loading indicator with status message during AI processing
    - Handle Gemini errors: display error card with retry button
    - Handle empty layout response: show info message suggesting clearer image
    - Pass parsed layout to PreviewStep, pass confirmed layout to ConfirmStep
    - Create corresponding `UploadConverterModal.css`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 5. Integrate modal into the existing Floor Plan page
  - [ ] 5.1 Add Upload Floor Plan button and modal to `src/app/(dashboard)/digital-twin/floor-plan/page.js`
    - Add "Upload Floor Plan" button in the page header, visible only when `canEdit()` returns true (QC/Admin)
    - Import and render `UploadConverterModal` component, controlled by open/close state
    - After successful layout save, call `fetchSlots()` to reload the floor plan with new layout
    - _Requirements: 5.3, 6.1, 6.2_

  - [ ] 5.2 Update floor plan page to support dynamic room layouts from database
    - Modify the existing `ROOMS` constant to be overridable by database-stored layout data
    - When layout exists in DB, fetch and render the stored zones/slots instead of hardcoded ROOMS
    - Ensure all existing interactions work: click slot to view details, add items, edit/delete items
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Final integration and wiring
  - [ ] 7.1 Wire inventory preservation logic in layout replacement
    - When replacing an existing layout, query occupied slots and their item_ids
    - After inserting new slots, re-link inventory items to matching slot IDs (where old slot ID exists in new layout)
    - Verify preserved items show as occupied in the new layout
    - _Requirements: 5.4_

  - [ ]* 7.2 Write property test for inventory preservation (Property 7)
    - **Property 7: Inventory items are preserved for matching slots during layout replacement**
    - **Validates: Requirements 5.4**
    - Generate old layouts with occupied slots and new layouts with overlapping slot IDs, verify items remain linked

  - [ ]* 7.3 Write integration tests for end-to-end upload flow
    - Test full flow: file upload → Gemini mock response → preview rendering → confirm → database save
    - Verify saved slots are loadable by existing `/api/slots` GET endpoint
    - Verify floor plan page renders correctly with newly saved layout
    - _Requirements: 4.1, 4.3, 5.3_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses JavaScript (Next.js App Router with React 19), `pg` for PostgreSQL, and the Gemini API is already integrated
- All new components follow existing patterns: `'use client'` directive, `useAuth()` hook for access control, `lucide-react` for icons, custom CSS with CSS variables
- The Gemini API key is accessed via `process.env.NEXT_PUBLIC_GEMINI_API_KEY` following the existing copilot upload pattern
- `fast-check` must be installed as a dev dependency for property-based tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "1.5", "1.6", "1.7", "2.1"] },
    { "id": 2, "tasks": ["2.2", "4.1", "4.2", "4.3"] },
    { "id": 3, "tasks": ["4.4"] },
    { "id": 4, "tasks": ["5.1", "5.2"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3"] }
  ]
}
```
