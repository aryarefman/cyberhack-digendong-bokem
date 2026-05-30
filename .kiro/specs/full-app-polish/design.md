# Design Document: Full App Polish

## Overview

This design covers the full application polish for AromaSys (SIMA AROME), addressing dashboard layout alignment with the Hikari branch, floor plan AI analysis and editability, OCR data ingestion, chatbot integration via navbar, UI consistency, and ensuring all interactive elements are functional. The system uses a split AI routing strategy where heavy processing goes through the Express backend and lightweight calls go directly from the Next.js frontend to Gemini.

## Architecture

The AromaSys (SIMA AROME) application follows a split architecture with a Next.js 16 frontend (React 19) and an Express 5 backend connected to PostgreSQL. AI capabilities are powered by Google Gemini (gemini-2.5-flash) with a split routing strategy: heavy processing (floor plan image+PDF analysis) routes through the backend, while lightweight AI calls (chatbot, OCR single-file, recommendations) go directly from the frontend.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │Dashboard │  │Floor Plan│  │  Data    │  │   Chatbot    │   │
│  │  Page    │  │  Page    │  │Ingestion │  │  Overlay     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │              │               │           │
│       │         ┌────┴────┐    ┌────┴────┐    ┌────┴────┐      │
│       │         │ Direct  │    │ Direct  │    │ Direct  │      │
│       │         │ Gemini  │    │ Gemini  │    │ Gemini  │      │
│       │         │(img only)│   │  (OCR)  │    │ (chat)  │      │
│       │         └─────────┘    └─────────┘    └─────────┘      │
│  ┌────┴──────────────┴──────────────┴───────────────────┐      │
│  │                   api.ts (fetch wrapper)               │      │
│  └───────────────────────────┬───────────────────────────┘      │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP (JWT Auth)
┌──────────────────────────────┼──────────────────────────────────┐
│                     Backend (Express 5)                          │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌───────────────────┐   │
│  │inventory│ │  slots   │ │  audit  │ │ floor-plan-upload │   │
│  │ routes  │ │  routes  │ │ routes  │ │  (Multer+Gemini)  │   │
│  └────┬────┘ └────┬─────┘ └────┬────┘ └────────┬──────────┘   │
│       └────────────┴────────────┴───────────────┘               │
│                          │                                       │
│                    ┌─────┴─────┐                                 │
│                    │PostgreSQL │                                  │
│                    └───────────┘                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Dashboard Page (`/overview`)
- **StatCards**: Grid of 4 summary cards (Total Active Stock, Nearing Expiry, Warehouse Capacity, Cold-Chain Alerts)
- **WeeklyStockChart**: Recharts `LineChart` with `ResponsiveContainer`, fetching trend data from `/api/dashboard/stats`
- **ZoneSummaryCards**: Capacity bars per zone with color-coded thresholds (green < 70%, amber 70-90%, red > 90%)
- **ExpiryAlertsPanel**: List of items nearing expiry with days-left countdown
- **QuickStats**: Category count, average days to expiry, expired count
- **ActivityTimeline**: Recent audit log entries with timeline UI

#### 2. Floor Plan Page (`/floor-plan`)
- **FloorPlanCanvas**: Container `div` with `ref` for coordinate calculations, displays either default grid or custom uploaded image
- **InteractiveZone**: Draggable/resizable overlay zones with edge handles (top, right, bottom, left)
- **ZoneDetailsModal**: Modal for editing zone name, sensor config, and material assignments
- **UploadPanel**: Dual drop-zone for image (PNG/JPG/WEBP) and optional PDF upload
- **AIRecommendationPanel**: Displays placement suggestions based on zone classification and inventory state
- **ZoneMismatchWarning**: Alert when item category doesn't match zone classification

#### 3. Data Ingestion Page (`/data-ingestion`)
- **FileUploadZone**: Drag-and-drop area accepting images and PDFs
- **OcrResultsTable**: Editable table with columns: name, category, qty, unit, lot number, location, expiry, confidence
- **DuplicateWarningIndicator**: Row-level warning when name+lot matches existing inventory
- **IngestionHistory**: Paginated table of past upload records
- **SaveToInventoryButton**: Batch save with loading state and error handling

#### 4. Chatbot (`ChatbotOverlay`)
- **NavbarTrigger**: Bot icon button in top navigation bar (replaces floating button)
- **SlideInPanel**: Right-side panel with spring animation via Framer Motion
- **MessageList**: Scrollable chat history with user/AI message bubbles
- **QuickPresets**: Horizontal scrollable preset buttons for common queries
- **InputBar**: Text input with send button, disabled during loading

#### 5. Authentication Pages
- **LoginPage / RegisterPage**: Back arrow button centered using flexbox (`items-center justify-center`)
- **AuthFormWrapper**: Consistent layout wrapper ensuring alignment across viewports

#### 6. Sidebar Navigation
- **SidebarItem**: Individual nav link with icon, label, and active state
- **SidebarGroups**: Grouped sections (MAIN, WAREHOUSE, PRODUCTION, SETTINGS)
- **CollapsibleSidebar**: Responsive collapse for mobile viewports

### Backend Components

#### 1. Floor Plan Upload Route (`/api/floor-plan-upload`)
- Multer memory storage with 10MB file size limit
- Accepts `image` (PNG/JPG/WEBP) and `pdf` (application/pdf) fields
- Sends PDF buffer as base64 to Gemini for zone extraction
- Returns `{ success: boolean, zones: ZoneDetection[] }`

#### 2. Dashboard Stats Route (`/api/dashboard/stats`)
- Aggregates inventory data for weekly trend, zone summary, expiry alerts, quick stats
- Returns pre-computed dashboard statistics

#### 3. Inventory Route (`/api/inventory`)
- CRUD operations for inventory items
- Zone assignment on creation
- Audit trail logging on modifications

#### 4. Slots Route (`/api/slots`)
- Manages warehouse slot assignments
- Links inventory items to physical locations

## Interfaces

### Frontend API Layer (`api.ts`)

```typescript
// Existing api utility — no changes needed to interface
export const api = {
  get: <T>(path: string, opts?: FetchOptions) => Promise<T>,
  post: <T>(path: string, body?: unknown, opts?: FetchOptions) => Promise<T>,
  put: <T>(path: string, body?: unknown, opts?: FetchOptions) => Promise<T>,
  delete: <T>(path: string, opts?: FetchOptions) => Promise<T>,
  postForm: <T>(path: string, body: FormData, opts?: FetchOptions) => Promise<T>,
};
```

### Gemini AI Direct Call Interface

```typescript
interface GeminiRequest {
  contents: Array<{
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }> };
  }>;
}

// Direct frontend call pattern
async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
    { text: prompt }
  ];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/png', data: imageBase64 } });
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  
  const data: GeminiResponse = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}
```

### Floor Plan Upload Backend Interface

```typescript
// POST /api/floor-plan-upload
// Content-Type: multipart/form-data
// Fields: image (file), pdf (file, optional)

interface FloorPlanUploadResponse {
  success: boolean;
  zones: ZoneDetection[];
  error?: string;
}

interface ZoneDetection {
  id: string;
  name: string;
  position: { x: number; y: number; width: number; height: number }; // percentages 0-100
}
```

### Zone Management Interface

```typescript
interface InteractiveZone {
  id: string;
  name: string;
  position: { x: number; y: number; width: number; height: number };
  hasTempSensor: boolean;
  tempApiUrl?: string;
  hasHumidSensor: boolean;
  humidApiUrl?: string;
  isSetup?: boolean;
  materials?: Material[];
}

interface Material {
  id: string;
  name: string;
  qty: number;
  unit: string;
  maxCapacity?: number;
}

// localStorage keys
const STORAGE_KEYS = {
  INTERACTIVE_ZONES: 'aromasys_interactive_zones',
  FLOOR_PLAN: 'aromasys_floor_plan',
  FLOOR_PLAN_IMAGE: 'aromasys_floor_plan_image',
  DELETED_DEFAULT_ZONES: 'aromasys_deleted_default_zones',
  INGESTION_HISTORY: 'aromasys_ingestion_history',
};
```

### OCR Data Ingestion Interface

```typescript
interface OcrItem {
  name: string;
  category: string;
  qty: number;
  unit: string;
  expiry: string;
  confidence: number;
  lotNumber: string;
  location?: string;
  zone?: string;
}

interface UploadRecord {
  id: string;
  fileName: string;
  fileSize: string;
  category: string;
  recordCount: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Validated' | 'Processing' | 'Failed';
  notes: string;
}
```

### Dashboard Stats Interface

```typescript
interface DashboardStatsResponse {
  success: boolean;
  weeklyTrend: Array<{ date: string; count: number }>;
  zoneSummary: Array<{ zone: string; itemCount: number; totalSlots: number; capacityPercent: number }>;
  expiryAlerts: Array<{ id: string; name: string; zone: string; daysLeft: number }>;
  quickStats: { totalCategories: number; avgDaysToExpiry: number; expiredCount: number };
}
```

## Data Models

### PostgreSQL Tables (existing)

```sql
-- inventory table
CREATE TABLE inventory (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  qty DECIMAL NOT NULL,
  unit VARCHAR(20) NOT NULL,
  location VARCHAR(50),
  zone VARCHAR(10),
  date_in DATE DEFAULT CURRENT_DATE,
  expiry DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Aman',
  image TEXT
);

-- slots table
CREATE TABLE slots (
  id VARCHAR(20) PRIMARY KEY,
  zone VARCHAR(10) NOT NULL,
  row VARCHAR(5) NOT NULL,
  col INTEGER NOT NULL,
  occupied BOOLEAN DEFAULT FALSE,
  item_id VARCHAR(50) REFERENCES inventory(id)
);

-- audit_logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  username VARCHAR(100),
  role VARCHAR(50),
  action VARCHAR(100),
  detail TEXT,
  module VARCHAR(50)
);
```

### Client-Side State (localStorage)

| Key | Type | Description |
|-----|------|-------------|
| `aromasys_interactive_zones` | `InteractiveZone[]` | Custom zone configurations with positions and materials |
| `aromasys_floor_plan` | `CustomFloorPlan` | Uploaded floor plan image data URL and metadata |
| `aromasys_floor_plan_image` | `string` | Legacy: base64 image data URL |
| `aromasys_deleted_default_zones` | `string[]` | IDs of hidden default zones |
| `aromasys_ingestion_history` | `UploadRecord[]` | OCR upload history records |
| `aromasys_token` | `string` | JWT authentication token |
| `aromasys_user` | `string` | Serialized user object |

## Error Handling

### Frontend Error Strategy

1. **API Failures**: All `api.*` calls wrapped in try/catch. On failure:
   - Display toast notification with error description
   - Provide retry mechanism (retry button or automatic retry)
   - Log error to console for debugging

2. **AI/Gemini Failures**: Fallback chain (gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash). If all fail:
   - Display descriptive error message
   - Allow user to retry the operation
   - For OCR: show "Failed to extract data" with retry button
   - For chatbot: show "Cannot connect to AI" message

3. **File Upload Errors**:
   - Invalid file type: immediate rejection with format guidance
   - File too large: rejection with size limit message
   - Upload failure: error toast with retry option

4. **Form Validation**:
   - Client-side validation before submission
   - Server-side validation errors displayed inline
   - Disabled submit buttons during async operations

### Backend Error Strategy

1. **Multer Errors**: File size/type validation with 400 status codes
2. **Gemini API Errors**: Catch and return `{ success: false, error: message }`
3. **Database Errors**: Generic 500 with logged details, sanitized client response
4. **Auth Errors**: 401 response triggers frontend token cleanup and redirect

## Zone-Category Mapping Logic

```typescript
// Category to recommended zone mapping
const CATEGORY_ZONE_MAP: Record<string, string> = {
  'Kimia': 'E',      // Hazard Storage
  'Pengawet': 'E',   // Hazard Storage
  'Susu': 'D',       // Cold Storage
  'Cokelat': 'D',    // Cold Storage
  'Tepung': 'A',     // Dry Storage
  'Gula': 'A',       // Dry Storage
  'Minyak': 'B',     // Liquid Storage
  'Pewarna': 'B',    // Liquid Storage
  'Essence': 'B',    // Liquid Storage
  'Rempah': 'C',     // General Storage
};

function detectZoneMismatch(itemCategory: string, currentZone: string): boolean {
  const recommendedZone = CATEGORY_ZONE_MAP[itemCategory];
  if (!recommendedZone) return false; // Unknown category, no mismatch
  return recommendedZone !== currentZone;
}
```

## Drag & Resize Coordinate System

```typescript
// All zone positions are stored as percentages (0-100) relative to canvas
interface ZonePosition {
  x: number;      // left offset as % of canvas width
  y: number;      // top offset as % of canvas height
  width: number;  // zone width as % of canvas width (min: 5)
  height: number; // zone height as % of canvas height (min: 5)
}

// Drag calculation
function calculateDragPosition(
  startPos: ZonePosition,
  dragDelta: { dx: number; dy: number } // in percentage units
): ZonePosition {
  return {
    ...startPos,
    x: Math.max(0, Math.min(100 - startPos.width, startPos.x + dragDelta.dx)),
    y: Math.max(0, Math.min(100 - startPos.height, startPos.y + dragDelta.dy)),
  };
}

// Resize calculation (right edge example)
function calculateResizeRight(
  startPos: ZonePosition,
  widthDelta: number // in percentage units
): ZonePosition {
  return {
    ...startPos,
    width: Math.max(5, Math.min(100 - startPos.x, startPos.width + widthDelta)),
  };
}
```

## Testing Strategy

- **Property-based tests**: Validate universal invariants (zone coordinate clamping, localStorage round-trips, mismatch detection, deletion correctness) using generated inputs with 100+ iterations per property
- **Example-based unit tests**: Verify specific UI rendering (dashboard stat cards, chart presence, sidebar groups, auth page alignment)
- **Integration tests**: Verify API call routing (Gemini direct vs backend), data fetching on page load, CRUD operations
- **Edge case tests**: Error handling for AI failures, empty results, file type rejections
- **Smoke tests**: Environment variable configuration, Multer middleware setup

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Zone Summary Card Data Integrity

*For any* zone summary data object containing a zone identifier, item count, and capacity percentage, the rendered ZoneSummaryCard component SHALL display the exact item count and capacity percentage values from the input data.

**Validates: Requirements 1.4**

### Property 2: AI Zone Detection Output Validity

*For any* valid Gemini zone detection response array, all generated InteractiveZone objects SHALL have position coordinates (x, y, width, height) as percentages between 0 and 100, and SHALL have non-empty name strings.

**Validates: Requirements 3.2, 3.6**

### Property 3: Zone Drag Position Clamping

*For any* zone with a starting position and *for any* drag delta (dx, dy), the resulting zone position SHALL satisfy: `x >= 0`, `y >= 0`, `x + width <= 100`, and `y + height <= 100`, ensuring zones never extend beyond the canvas boundaries.

**Validates: Requirements 4.1**

### Property 4: Zone Resize Minimum Size Invariant

*For any* zone and *for any* resize operation on any edge (top, right, bottom, left), the resulting zone dimensions SHALL satisfy `width >= 5` and `height >= 5`.

**Validates: Requirements 4.2**

### Property 5: Zone Configuration localStorage Round-Trip

*For any* valid array of InteractiveZone objects, serializing to localStorage via `JSON.stringify` and deserializing via `JSON.parse` SHALL produce an array that is deeply equal to the original input.

**Validates: Requirements 4.4, 4.7**

### Property 6: Zone Deletion Correctness

*For any* zone list of length N (where N > 0) and *for any* valid zone ID present in the list, deleting that zone SHALL produce a list of length N-1 that does not contain any zone with the deleted ID.

**Validates: Requirements 4.5**

### Property 7: Zone Count Maximum Invariant

*For any* sequence of "Add Zone" operations starting from any initial zone count (0 to 30), the resulting zone count SHALL never exceed 30.

**Validates: Requirements 4.6**

### Property 8: Zone-Category Mismatch Detection

*For any* item category and *for any* zone classification, the mismatch detector SHALL return `true` if and only if the category's recommended zone (per CATEGORY_ZONE_MAP) differs from the current zone classification.

**Validates: Requirements 5.4**

### Property 9: OCR Item Edit State Update

*For any* OcrItem array and *for any* valid index and *for any* field update (name, category, qty, unit, expiry, lotNumber), applying the edit SHALL produce a new array where only the targeted item's targeted field is changed, and all other items and fields remain unchanged.

**Validates: Requirements 6.4**

### Property 10: Multi-File OCR Result Accumulation

*For any* sequence of OCR result arrays (each from a separate file upload), the accumulated extraction table SHALL contain all items from all results, with total length equal to the sum of individual result lengths.

**Validates: Requirements 6.7, 7.4**

### Property 11: Upload History Record Completeness

*For any* file processing event with a file name, file size, and extracted item count, the created UploadRecord SHALL contain non-empty values for all required fields: id, fileName, fileSize, category, recordCount, uploadedBy, uploadedAt, and status.

**Validates: Requirements 6.8**

### Property 12: Duplicate Detection by Name and Lot Number

*For any* extracted OcrItem and *for any* existing inventory list, the duplicate detector SHALL flag the item as a duplicate if and only if there exists an inventory item with both the same name (case-insensitive) AND the same lot number.

**Validates: Requirements 7.1**

### Property 13: OCR Row Deletion Correctness

*For any* OcrItem array of length N (where N > 0) and *for any* valid index, deleting the row at that index SHALL produce an array of length N-1 that does not contain the deleted item.

**Validates: Requirements 7.3**

### Property 14: Chat Conversation History Ordering

*For any* sequence of sent messages, the conversation history array SHALL contain all messages in chronological order (by timestamp), with no messages lost or reordered.

**Validates: Requirements 8.5**

### Property 15: Form Input Validation Correctness

*For any* form field with defined constraints (e.g., required, min/max length, pattern) and *for any* input value, the validation function SHALL return valid for inputs satisfying all constraints and invalid for inputs violating any constraint.

**Validates: Requirements 10.3**

### Property 16: Async Button Disable Invariant

*For any* button that triggers an async operation, the button's disabled state SHALL be `true` from the moment the operation starts until the moment it completes (success or failure), preventing duplicate submissions.

**Validates: Requirements 10.6**
