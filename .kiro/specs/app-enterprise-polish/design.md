# Design Document: App Enterprise Polish

## Overview

Enterprise polish specification for the AromaSys (SIMA AROME) warehouse management system. This design covers branding updates, UI consistency fixes, new role management, notification persistence, dashboard enhancements, floor plan improvements, cold chain filtering, data ingestion UX, auto-report capabilities, audit trail enhancements, admin profile sync, AI pipeline upgrades with multi-model support, new AI QC features, and enterprise readiness patterns.

## Architecture

This feature set enhances the AromaSys (SIMA AROME) warehouse management system across branding, UI consistency, role management, notification persistence, dashboard improvements, floor plan interactions, cold chain filtering, data ingestion UX, auto-report capabilities, audit trail enhancements, admin profile sync, AI pipeline upgrades, AI QC module, and enterprise readiness patterns.

The architecture follows the existing separation: Next.js 16 frontend (React 19 + Tailwind CSS + Framer Motion) communicating with an Express 5 backend backed by PostgreSQL. AI capabilities use Google Gemini with a configurable fallback chain.

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Dashboard │ │Floor Plan│ │  QC Page │ │ Toast System │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │Cold Chain│ │Data Ingest│ │Auto Report│ │ Audit Trail  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AI Pipeline (lib/gemini.ts)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ REST API
┌─────────────────────────────────────────────────────────────┐
│                    Express 5 Backend                         │
│  ┌────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Auth  │ │Notifications│ │   QC    │ │  Rate Limit  │   │
│  └────────┘ └────────────┘ └──────────┘ └──────────────┘   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Middleware (auth, logging, validation)      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────────────┐
                    │  PostgreSQL   │
                    └───────────────┘
```

---

## Components and Interfaces

### 1. Logo Replacement

**Affected Components:** Sidebar, Login Page, Register Page

All logo references change from `logo-aromasys.png` to `logo-aromasys-new.png`. The image is already placed at `frontend/public/logo-aromasys-new.png`.

```tsx
// In Sidebar, Login, Register components:
<Image src="/logo-aromasys-new.png" alt="AromaSys" width={140} height={40} />
```

### 2. Toast Notification System

**New Component:** `@/components/ToastContainer.tsx`

A global toast container rendered at the app layout level using a fixed position at bottom-right with `z-[9999]`.

```tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// ToastContainer positioning
const containerStyles = "fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2";
```

**Toast Context:** A React context provides `addToast` and `removeToast` functions globally. Toasts auto-dismiss after a configurable duration (default 4s) with Framer Motion exit animations.

### 3. Auth Back Button Navigation

**Affected Components:** Login Page, Register Page

Replace any `router.back()` calls with explicit `router.push('/')` for the back button on auth pages.

```tsx
// Direct navigation instead of history-based
const handleBack = () => router.push('/');
```

### 4. Production Planner (PPIC) Role

**Backend Changes:**
- Add `'PPIC'` to the allowed roles enum/validation in auth routes
- Update `requireRole` middleware usage to include PPIC where appropriate

**Frontend Changes:**
- Add `{ value: 'PPIC', label: 'Production Planner (PPIC)' }` to role selection options
- Grant PPIC access to inventory, FIFO/expiry, and production planning features

**Database:** No schema change needed — the `role` column is VARCHAR(50) and already stores role strings.

### 5. Notification Persistence

**New Database Table:**

```sql
CREATE TABLE notification_reads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id VARCHAR(100) NOT NULL,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);
```

**New Backend Routes:** `backend/src/routes/notifications.js`

```typescript
// GET /api/notifications/read-state?userId=:id
// Returns array of read notification IDs for the user

// POST /api/notifications/mark-read
// Body: { userId, notificationIds: string[] }
// Marks specified notifications as read

// POST /api/notifications/mark-all-read
// Body: { userId }
// Marks all current notifications as read
```

**Frontend Changes:**
- Replace localStorage read-state logic with API calls
- On mount: fetch read state from backend
- On mark-read: POST to backend, update local state optimistically

### 6. Dashboard Zone Capacity Indicators

**Utility Function:** `getCapacityColor(utilization: number): string`

```typescript
export function getCapacityColor(utilization: number): string {
  if (utilization < 50) return 'green';
  if (utilization <= 80) return 'yellow';
  return 'red';
}

export function calculateUtilization(occupied: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((occupied / total) * 100);
}
```

The dashboard already returns `capacityPercent` from the `/api/dashboard/stats` endpoint. The frontend maps this to color-coded indicators using Tailwind classes.

### 7. Floor Plan Upload Card Fix

**Affected Component:** Floor Plan Upload Modal

Changes:
- Remove `overflow-hidden` from modal container
- Set modal width to `max-w-2xl` minimum for side-by-side drop zones
- Use `flex flex-row gap-4` for the two drop zones
- Ensure backdrop uses `fixed inset-0 bg-black/50 z-[9998]`

```tsx
// Modal container
<div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center">
  <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
    <div className="flex flex-row gap-4">
      <DropZone accept="image/*" label="Image" />
      <DropZone accept=".pdf" label="PDF" />
    </div>
  </div>
</div>
```

### 8. Floor Plan Zone Drag & Resize

**Existing Utilities:** `@/lib/zones.ts` already provides `calculateDragPosition`, `calculateResizeRight`, `calculateResizeLeft`, `calculateResizeTop`, `calculateResizeBottom`.

**UI Changes:**
- Add an arrow icon (Lucide `ArrowUpRight` or `ExternalLink`) overlay on each zone
- Zone body `onMouseDown` initiates drag (does NOT open details)
- Arrow icon `onClick` (with `stopPropagation`) opens zone details modal
- Resize handles on edges/corners trigger respective resize calculations
- After each drag/resize, persist to localStorage via `STORAGE_KEYS.INTERACTIVE_ZONES`

**Interaction Model:**
```
Zone Body Click/Drag → Drag operation (no detail popup)
Arrow Icon Click → Open zone details
Edge/Corner Drag → Resize operation
```

### 9. Cold Chain Zone Filter

**Frontend State:**

```typescript
const [activeZone, setActiveZone] = useState<string>('all');
const zones = ['all', 'A', 'B', 'C', 'D', 'E'];

const filteredData = activeZone === 'all' 
  ? temperatureData 
  : temperatureData.filter(d => d.zone === activeZone);
```

**UI:** Horizontal button group with active state styling (filled background for selected, outline for others).

### 10. Ingestion History Enhancements

**Changes:**
- Add delete button (Lucide `Trash2` icon) to each history row
- Delete removes from localStorage `STORAGE_KEYS.INGESTION_HISTORY` array
- Replace generic loading animation with a circular spinner component during file processing

```tsx
// Spinner component
const Spinner = () => (
  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
);
```

### 11. Data Ingestion Action Column Position

**Table Column Reorder:** Move the action column definition to index 0 in the columns array.

```typescript
const columns = [
  { key: 'actions', label: 'Actions', sticky: true },
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  // ... remaining columns
];
```

Apply `sticky left-0 z-10 bg-white` to the action column cells for scroll persistence.

### 12. Auto-Report Enhancements

**Report Content Structure:**

```typescript
interface ReportContent {
  summary: {
    inventoryStatus: { total: number; byZone: ZoneSummary[] };
    zoneUtilization: { zone: string; percent: number }[];
    expiryAlerts: ExpiryItem[];
    trendAnalysis: string;
  };
  customNotes: string;
  generatedAt: string;
}
```

**Export Logic:**
- PDF export: Uses a PDF generation library (e.g., jsPDF or html2canvas) to render full report with headers, sections, charts, and custom notes
- Excel export: Generates tabular data only (inventory rows, metrics) without formatting or custom notes
- Custom notes field: `<textarea>` bound to report state, included in PDF but excluded from Excel

### 13. Audit Trail Profile Photos

**Backend Change:** Join `users` table when fetching audit logs to include avatar data.

```sql
SELECT al.*, u.avatar, u.name as user_name
FROM audit_logs al
LEFT JOIN users u ON al.username = u.name
ORDER BY al.id DESC;
```

**Frontend Rendering:**

```tsx
function AuditAvatar({ avatar, name }: { avatar: string | null; name: string }) {
  if (avatar) {
    return <img src={avatar} className="w-8 h-8 rounded-full object-cover" />;
  }
  const initials = getInitials(name);
  return <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">{initials}</div>;
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
```

### 14. Admin Profile Sync

**Backend Enhancement:** Extend `PUT /api/profile` to support admin editing another user's profile.

```typescript
// PUT /api/profile/admin-edit
// Body: { adminId, targetUserId, name?, email?, role?, avatar? }
// Requires: admin role
// Action: Updates target user record + creates audit log with admin as actor
```

**Audit Log Entry:**
```
actor: admin.name, action: 'Admin Edit Profile', detail: 'Admin updated [field] for [employee name]'
```

### 15. AI Pipeline Multi-Model Upgrade

**Enhanced `@/lib/gemini.ts`:**

```typescript
export type AITaskType = 'floor-plan' | 'ocr' | 'chatbot' | 'qc';

interface ModelConfig {
  taskType: AITaskType;
  models: string[]; // Ordered fallback chain
  endpoint?: string; // For external models
}

const DEFAULT_CONFIG: ModelConfig[] = [
  { taskType: 'floor-plan', models: ['gemini-2.5-flash', 'gemini-2.0-flash'] },
  { taskType: 'ocr', models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'] },
  { taskType: 'chatbot', models: ['gemini-2.5-flash', 'gemini-2.0-flash'] },
  { taskType: 'qc', models: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'] },
];

export async function callAI(
  prompt: string,
  taskType: AITaskType,
  imageBase64?: string,
  mimeType?: string
): Promise<string> {
  const config = getConfigForTask(taskType);
  // Try each model in the fallback chain
  for (const model of config.models) {
    try {
      return await callModel(model, prompt, imageBase64, mimeType, config.endpoint);
    } catch (error) {
      continue; // Fall back to next model
    }
  }
  throw new Error('All models in pipeline failed');
}
```

### 16. AI Quality Control Module

**New Page:** `frontend/src/app/(dashboard)/qc/page.tsx`

**Components:**
- `QCInspectionPanel` — Main panel with tabs for Fruit/Raw-Material and Extract/Powder
- `CameraCapture` — Uses `navigator.mediaDevices.getUserMedia()` for camera access, captures to canvas
- `QCResultDisplay` — Shows pass/fail badge, confidence %, defect notes

**Backend Route:** `backend/src/routes/qc.js`

```typescript
// POST /api/qc/inspect
// Body: { imageBase64, materialType, materialId }
// Returns: { result: 'pass'|'fail', confidence: number, notes: string }

// GET /api/qc/history?materialId=...
// Returns inspection history for a material
```

**New Database Table:**

```sql
CREATE TABLE qc_inspections (
  id SERIAL PRIMARY KEY,
  material_id VARCHAR(100) NOT NULL,
  material_type VARCHAR(50) NOT NULL,
  result VARCHAR(10) NOT NULL CHECK (result IN ('pass', 'fail')),
  confidence DECIMAL(5, 2) NOT NULL,
  notes TEXT,
  image TEXT,
  inspected_by INTEGER REFERENCES users(id),
  inspected_at TIMESTAMP DEFAULT NOW()
);
```

**AI Prompt Template:**
```
Analyze this [materialType] image for quality control.
Determine: PASS or FAIL
Provide: confidence percentage (0-100), identified defects or quality notes.
Response format: JSON { "result": "pass"|"fail", "confidence": number, "notes": "string" }
```

### 17. Enterprise Readiness

#### 17a. Input Validation Middleware

```javascript
// backend/src/middleware/validate.js
import { body, validationResult } from 'express-validator';

export function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }
    next();
  };
}
```

#### 17b. Rate Limiting

```javascript
// backend/src/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { success: false, error: 'Too many attempts, try again later', code: 'RATE_LIMITED' }
});
```

#### 17c. Structured Error Responses

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: unknown;
  correlationId?: string;
}
```

All error responses follow this structure with codes like `VALIDATION_ERROR`, `AUTH_FAILED`, `NOT_FOUND`, `RATE_LIMITED`, `INTERNAL_ERROR`.

#### 17d. Retry with Exponential Backoff (Frontend)

```typescript
// frontend/src/lib/api.ts
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status >= 500 && attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000); // 1s, 2s, 4s
        continue;
      }
      return res;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  throw new Error('Max retries exceeded');
}
```

#### 17e. Connection Pooling

Already implemented in `backend/src/lib/db.js` with `max: 5`. Increase to `max: 20` for enterprise load and add health check query.

#### 17f. JWT Token Refresh

```typescript
// Backend: POST /api/auth/refresh
// Accepts a valid (non-expired) token, returns a new token with extended expiry
// Frontend: Intercept 401 responses, attempt refresh, retry original request
```

#### 17g. Request Logging with Correlation IDs

```javascript
// backend/src/middleware/correlationId.js
import { randomUUID } from 'crypto';

export function correlationId(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || randomUUID();
  res.setHeader('x-correlation-id', req.correlationId);
  console.log(JSON.stringify({
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  }));
  next();
}
```

#### 17h. Graceful AI Degradation

When AI services are unavailable:
- Chatbot shows "AI temporarily unavailable" message
- QC module shows manual inspection form as fallback
- OCR/data ingestion shows manual entry form
- Floor plan analysis shows upload-only mode without AI suggestions
- Core warehouse operations (inventory, FIFO, cold chain) continue unaffected

---

## Data Models

### New Tables

```sql
-- Notification read state persistence
CREATE TABLE notification_reads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id VARCHAR(100) NOT NULL,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, notification_id)
);

-- QC inspection records
CREATE TABLE qc_inspections (
  id SERIAL PRIMARY KEY,
  material_id VARCHAR(100) NOT NULL,
  material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('fruit', 'raw-material', 'extract', 'powder')),
  result VARCHAR(10) NOT NULL CHECK (result IN ('pass', 'fail')),
  confidence DECIMAL(5, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  notes TEXT,
  image TEXT,
  inspected_by INTEGER REFERENCES users(id),
  inspected_at TIMESTAMP DEFAULT NOW()
);
```

### Modified Tables

```sql
-- Users table: no schema change needed (role is VARCHAR(50), avatar is TEXT)
-- Audit logs: add optional user_id column for photo joins
ALTER TABLE audit_logs ADD COLUMN user_id INTEGER REFERENCES users(id);
```

---

## API Interfaces

### New Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications/read-state` | Required | Get read notification IDs for user |
| POST | `/api/notifications/mark-read` | Required | Mark specific notifications as read |
| POST | `/api/notifications/mark-all-read` | Required | Mark all notifications as read |
| PUT | `/api/profile/admin-edit` | Admin | Admin edits another user's profile |
| POST | `/api/auth/refresh` | Required | Refresh JWT token |
| POST | `/api/qc/inspect` | QC/Admin | Submit image for AI QC inspection |
| GET | `/api/qc/history` | QC/Admin | Get inspection history |

### Modified Endpoints

| Method | Path | Change |
|--------|------|--------|
| GET | `/api/audit` | Join users table for avatar data |
| GET | `/api/dashboard/stats` | Already returns zone capacity data |
| POST | `/api/auth/login` | Add rate limiting middleware |
| POST | `/api/auth/register` | Add rate limiting + PPIC role support |

---

## Error Handling

### Error Code Taxonomy

```typescript
const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  AUTH_FAILED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  AI_UNAVAILABLE: 503,
} as const;
```

### AI Failure Handling

1. Primary model fails → try next in fallback chain
2. All models fail → return `AI_UNAVAILABLE` error
3. Frontend catches `AI_UNAVAILABLE` → shows degraded UI with manual fallback
4. Non-AI features continue operating normally

### Frontend Error Handling

- Transient errors (5xx): Retry with exponential backoff (1s, 2s, 4s)
- Auth errors (401): Attempt token refresh, retry once
- Validation errors (400): Display field-level error messages
- Rate limit (429): Show "too many attempts" toast with retry timer

---

## Testing Strategy

### Unit Tests
- Toast container positioning and stacking logic
- `getCapacityColor` and `calculateUtilization` pure functions
- `getInitials` function for avatar fallback
- Zone drag/resize calculation functions (already in `@/lib/zones.ts`)
- Cold chain filter logic
- AI pipeline fallback chain with mocked model responses
- Input validation middleware with various malicious inputs
- JWT refresh token generation and validation
- Exponential backoff timing calculations

### Integration Tests
- Notification read state API: mark-read → fetch → verify persistence
- Admin profile sync: admin edit → employee login → verify updated data
- QC inspection flow: submit image → verify DB record + audit entry
- Rate limiting: exceed threshold → verify 429 response
- Correlation ID: send request → verify header in response
- Auth back button navigation: click → verify route change

### Property-Based Tests
- Zone drag/resize functions with random positions and deltas (Properties 3, 4)
- Capacity color mapping with random utilization values (Property 2)
- Cold chain filter with random zone selections and data sets (Property 6)
- Notification read state round-trip with random notification IDs (Property 7)
- AI fallback chain with random failure patterns (Property 13)
- Input validation with generated malicious payloads (Property 16)
- Structured error response format across all error types (Property 18)
- Exponential backoff timing with random attempt counts (Property 19)

### Smoke Tests
- Logo renders on sidebar, login, and register pages
- PPIC role appears in role selection dropdown
- QC page loads with camera and inspection panels
- Floor plan upload card renders without clipping

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Toast positioning invariant

For any toast notification rendered at any viewport width between 320px and 1920px, the toast container SHALL maintain fixed positioning at the bottom-right corner of the viewport.

**Validates: Requirements 2.1, 2.3**

### Property 2: Zone capacity color mapping

For any zone with occupied slots and total slots, the capacity indicator color SHALL be green when `(occupied/total)*100 < 50`, yellow when `50 <= (occupied/total)*100 <= 80`, and red when `(occupied/total)*100 > 80`.

**Validates: Requirements 6.2, 6.3**

### Property 3: Drag position clamping

For any zone with any starting position and any drag delta, the resulting position from `calculateDragPosition` SHALL satisfy: `0 <= x <= 100 - width` and `0 <= y <= 100 - height`, ensuring the zone never extends beyond canvas boundaries.

**Validates: Requirements 8.1**

### Property 4: Resize minimum size enforcement

For any zone with any starting dimensions and any resize delta applied via `calculateResizeRight`, `calculateResizeLeft`, `calculateResizeTop`, or `calculateResizeBottom`, the resulting width SHALL be >= 5 and the resulting height SHALL be >= 5, and the zone SHALL not extend beyond canvas boundaries (0-100%).

**Validates: Requirements 8.2**

### Property 5: Zone position persistence round-trip

For any zone position update (drag or resize), persisting to localStorage and then reading back SHALL produce the same zone position values.

**Validates: Requirements 8.6**

### Property 6: Cold chain zone filter correctness

For any selected zone filter value (other than "all"), all displayed temperature data items SHALL have a `zone` field matching the selected filter value.

**Validates: Requirements 9.2**

### Property 7: Notification read state round-trip

For any user and any set of notification IDs marked as read via the API, fetching the read state for that user SHALL return all previously marked notification IDs.

**Validates: Requirements 5.1, 5.2, 5.4**

### Property 8: Ingestion history delete invariant

For any ingestion history list of length N, deleting one record SHALL result in a list of length N-1, and the deleted record's ID SHALL not appear in the resulting list.

**Validates: Requirements 10.2**

### Property 9: Action column position invariant

For any rendering of the data ingestion extraction results table, the first column (index 0) SHALL be the action column regardless of the data content.

**Validates: Requirements 11.1**

### Property 10: Custom notes export inclusion/exclusion

For any non-empty custom notes string, the PDF export output SHALL contain the notes content, and the Excel export output SHALL NOT contain the notes content.

**Validates: Requirements 12.5**

### Property 11: Audit trail avatar rendering

For any audit log entry, if the associated user has a non-null avatar, the rendered avatar SHALL display that image; if the user has no avatar, the rendered element SHALL display initials derived from the user's name (first letter of each word, max 2 characters, uppercased).

**Validates: Requirements 13.1, 13.3**

### Property 12: Admin profile edit audit logging

For any admin profile edit operation on a target employee, the system SHALL create an audit log entry where the actor is the admin user and the detail references the target employee.

**Validates: Requirements 14.3**

### Property 13: AI pipeline fallback chain

For any AI task where the primary model fails, the pipeline SHALL attempt the next model in the configured fallback chain, and SHALL only throw an error after all models in the chain have been attempted.

**Validates: Requirements 15.4**

### Property 14: QC inspection record completeness

For any completed QC inspection, the database record SHALL contain a non-null material_id, material_type, result (pass or fail), confidence (0-100), inspected_by user ID, and inspected_at timestamp, AND an audit trail entry SHALL be created for the inspection.

**Validates: Requirements 16.4, 16.6**

### Property 15: QC result display completeness

For any QC inspection result, the display SHALL include the pass/fail status, confidence percentage, and quality notes text.

**Validates: Requirements 16.5**

### Property 16: Input validation rejects malicious input

For any API endpoint accepting user input, submitting input containing SQL injection patterns, XSS scripts, or values exceeding maximum length SHALL result in a 400 response with error code `VALIDATION_ERROR`.

**Validates: Requirements 17.1**

### Property 17: Rate limiting enforcement

For any sequence of authentication requests exceeding the configured limit (10 requests per 15-minute window), subsequent requests SHALL receive a 429 response with error code `RATE_LIMITED`.

**Validates: Requirements 17.2**

### Property 18: Structured error response format

For any error response from any Backend_API endpoint, the response body SHALL contain `success: false`, a non-empty `error` string, and a non-empty `code` string.

**Validates: Requirements 17.3**

### Property 19: Exponential backoff retry timing

For any transient failure retry sequence, the delay between attempt N and attempt N+1 SHALL be `2^N * 1000` milliseconds (1s, 2s, 4s for attempts 0, 1, 2).

**Validates: Requirements 17.4**

### Property 20: JWT refresh produces valid token

For any valid non-expired JWT token submitted to the refresh endpoint, the response SHALL contain a new valid JWT token with an extended expiration time greater than the current time.

**Validates: Requirements 17.6**

### Property 21: Correlation ID propagation

For any request to any Backend_API endpoint, the response SHALL include an `x-correlation-id` header containing either the request's provided correlation ID or a newly generated UUID.

**Validates: Requirements 17.7**

### Property 22: PPIC role access control

For any user assigned the PPIC role, the authorization middleware SHALL grant access to production planning and inventory control endpoints, and SHALL deny access to admin-only endpoints.

**Validates: Requirements 4.4**

### Property 23: Auto-report content completeness

For any generated report, the report content SHALL include sections for inventory status, zone utilization, expiry alerts, and trend analysis.

**Validates: Requirements 12.1**
