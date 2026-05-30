# Design Document: AromaSys App Improvements

## Overview

This design covers 8 improvement areas for the AromaSys Warehouse Management System: functional pagination, informative dashboard with charts, profile photo upload with audit trail display, dynamic notification badge, inventory detail card modal, landing page branding, auth page text overlay, and database migration for the avatar column.

The improvements are scoped to the existing Next.js 16 (App Router) + React 19 + PostgreSQL (Neon) stack. No new backend frameworks are introduced. A lightweight charting library (recharts) will be added for the dashboard visualization. All other features use existing patterns (base64 storage, React Context, CSS per page).

### Key Design Decisions

1. **Charting library**: Use `recharts` — it's React-native, lightweight, and works well with SSR/CSR in Next.js App Router. No SVG-only or canvas-only alternatives needed.
2. **Image storage**: Base64 in PostgreSQL TEXT columns for both avatar and inventory images. This avoids external storage (S3) complexity for a demo/internal tool with a 2MB limit.
3. **Notification state**: Use React Context (`NotificationContext`) shared between the topbar layout and the notifications page. No backend persistence for notification read state — notifications are generated from system events and stored in-memory per session.
4. **Pagination**: Client-side pagination on the already-fetched inventory data. The dataset is small enough (< 1000 items) that server-side pagination adds unnecessary complexity.
5. **Dashboard chart data**: Compute weekly stock trend from inventory `date_in` field by counting active items per day over the last 7 days. This is derived from existing data without new tables.

## Architecture

```mermaid
graph TD
    subgraph "Client (React 19)"
        LP[Landing Page]
        AUTH[Login/Register Pages]
        DASH[Dashboard Page]
        FIFO[FIFO & Expiry Page]
        INV[Inventory Page]
        PROF[Profile Page]
        AUDIT[Audit Trail Page]
        NOTIF[Notifications Page]
        TOPBAR[Topbar Layout]
    end

    subgraph "Shared State"
        AC[AuthContext]
        NC[NotificationContext]
    end

    subgraph "API Routes (Next.js)"
        API_INV[/api/inventory]
        API_PROF[/api/profile]
        API_AUDIT[/api/audit]
        API_COLD[/api/cold-chain]
        API_AUTH[/api/auth/*]
        API_DASH[/api/dashboard/stats]
    end

    subgraph "Database (Neon PostgreSQL)"
        DB_USERS[users + avatar column]
        DB_INV[inventory + image column]
        DB_SLOTS[slots]
        DB_TEMP[temperature_readings]
        DB_AUDIT[audit_logs]
    end

    TOPBAR --> NC
    NOTIF --> NC
    DASH --> API_INV
    DASH --> API_AUDIT
    DASH --> API_COLD
    DASH --> API_DASH
    FIFO --> API_INV
    INV --> API_INV
    PROF --> API_PROF
    AUDIT --> API_AUDIT
    API_INV --> DB_INV
    API_PROF --> DB_USERS
    API_AUDIT --> DB_AUDIT
    API_DASH --> DB_INV
    API_DASH --> DB_TEMP
```

### Component Interaction Flow

1. **Pagination (FIFO page)**: Filtered items → `useMemo` computes paginated slice → pagination controls update `currentPage` state → re-renders table with correct slice.
2. **Dashboard charts**: On mount, fetch `/api/dashboard/stats` which returns weekly trend data, zone summary, and expiry alerts pre-computed server-side.
3. **Profile photo**: Upload triggers FileReader → base64 conversion → PUT `/api/profile` with avatar field → DB update → localStorage user object updated with avatar.
4. **Notification sync**: `NotificationContext` wraps the dashboard layout. Both topbar dropdown and notifications page consume the same context. Marking as read updates context state, which propagates to both consumers instantly.
5. **Inventory detail card**: Click row → set `selectedItem` state → render modal overlay with item details + image upload capability.

## Components and Interfaces

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `NotificationProvider` | `src/lib/notifications.js` | React Context for shared notification state |
| `PaginationControls` | Inline in FIFO page | Pagination UI with prev/next/page numbers |
| `InventoryDetailModal` | Inline in Inventory page | Modal card showing item details + image |
| `WeeklyStockChart` | Inline in Dashboard page | Recharts LineChart for stock trend |
| `ZoneSummaryCards` | Inline in Dashboard page | Zone capacity summary cards |
| `ExpiryAlertList` | Inline in Dashboard page | Nearest expiry items list |

### Modified Components

| Component | Changes |
|-----------|---------|
| `src/app/(dashboard)/layout.js` | Wrap with `NotificationProvider`, dynamic badge count from context |
| `src/app/(dashboard)/digital-twin/fifo-expiry/page.js` | Add functional pagination logic |
| `src/app/(dashboard)/dashboard/page.js` | Add chart, zone summary, expiry alerts, quick stats |
| `src/app/(dashboard)/settings/profile/page.js` | Add avatar upload area in Account tab |
| `src/app/(dashboard)/settings/audit/page.js` | Add avatar display next to actor name |
| `src/app/(dashboard)/settings/notifications/page.js` | Connect to NotificationContext |
| `src/app/(dashboard)/settings/inventory/page.js` | Add detail card modal on row click |
| `src/app/page.js` | Replace placeholder with AromaSys branding |
| `src/app/login/page.js` | Add text overlay on image panel |
| `src/app/register/page.js` | Add text overlay on image panel |
| `src/app/api/profile/route.js` | Handle avatar field in GET/PUT |
| `scripts/init-db.js` | Add `avatar` column to users, `image` column to inventory |

### API Interface Changes

#### GET /api/profile?userId={id}
**Response (updated):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "operator@aromasys.id",
    "role": "Operator",
    "avatar": "data:image/png;base64,..." | null
  }
}
```

#### PUT /api/profile (avatar upload)
**Request body (new field):**
```json
{
  "userId": 1,
  "avatar": "data:image/png;base64,iVBORw0KGgo..."
}
```
**Validation:**
- Must start with `data:image/(png|jpeg|webp);base64,`
- Total string length ≤ 2,796,202 characters (~2MB decoded)

#### GET /api/dashboard/stats (new endpoint)
**Response:**
```json
{
  "success": true,
  "weeklyTrend": [
    { "date": "2025-01-20", "count": 12 },
    { "date": "2025-01-21", "count": 13 }
  ],
  "zoneSummary": [
    { "zone": "A", "itemCount": 4, "totalSlots": 6, "capacityPercent": 67 }
  ],
  "expiryAlerts": [
    { "id": "INV-004", "name": "Pewarna Makanan Merah", "zone": "B", "daysLeft": 5 }
  ],
  "quickStats": {
    "totalCategories": 10,
    "avgDaysToExpiry": 45,
    "expiredCount": 2
  }
}
```

#### PUT /api/inventory (image upload addition)
**Request body (new optional field):**
```json
{
  "id": "INV-001",
  "image": "data:image/jpeg;base64,..."
}
```

### NotificationContext Interface

```javascript
// src/lib/notifications.js
const NotificationContext = createContext({
  notifications: [],           // Array of notification objects
  unreadCount: 0,              // Computed count of isRead=false
  markAsRead: (id) => {},      // Mark single notification as read
  markAllAsRead: () => {},     // Mark all as read
  addNotification: (notif) => {} // Add new notification
});
```

## Data Models

### Users Table (modified)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar TEXT DEFAULT NULL  -- base64 encoded image, max ~2MB
);
```

### Inventory Table (modified)
```sql
CREATE TABLE inventory (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  qty DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL,
  zone VARCHAR(50) NOT NULL,
  date_in DATE NOT NULL,
  expiry DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  image TEXT DEFAULT NULL  -- base64 encoded image, max ~2MB
);
```

### Notification Object (in-memory, no DB table)
```typescript
interface Notification {
  id: number;
  type: 'alert' | 'inventory' | 'coldchain' | 'upload' | 'audit' | 'system';
  title: string;
  description: string;
  time: string;       // ISO timestamp
  isRead: boolean;
}
```

### Pagination State Model
```typescript
interface PaginationState {
  currentPage: number;    // 1-indexed
  pageSize: number;       // Fixed at 10
  totalItems: number;     // Total filtered items count
  totalPages: number;     // Math.ceil(totalItems / pageSize)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Pagination slice correctness

*For any* array of items and any valid page number P (where 1 ≤ P ≤ totalPages), the paginated slice should return exactly items from index `(P-1)*10` to `min(P*10, totalItems) - 1`, and the slice length should be `min(10, totalItems - (P-1)*10)`.

**Validates: Requirements 1.2**

### Property 2: Filter resets pagination state

*For any* dataset and any filter operation that changes the filtered result set, the pagination state should reset to page 1 and totalPages should equal `Math.ceil(filteredItems.length / 10)`.

**Validates: Requirements 1.7**

### Property 3: Pagination info string correctness

*For any* valid pagination state (currentPage, pageSize=10, totalItems), the "Showing X to Y of Z" values should satisfy: X = `(currentPage-1)*10 + 1`, Y = `min(currentPage*10, totalItems)`, Z = `totalItems`, and X ≤ Y ≤ Z.

**Validates: Requirements 1.8**

### Property 4: Weekly stock trend computation

*For any* set of inventory items with various `date_in` and `status` fields, the weekly trend computation should produce exactly 7 data points (one per day), where each day's count equals the number of items that were active (non-expired, date_in ≤ that day) on that specific day.

**Validates: Requirements 2.1**

### Property 5: Zone summary computation

*For any* set of inventory items distributed across zones and a known slot configuration, the zone summary should report `itemCount` equal to the count of items in that zone, and `capacityPercent` equal to `Math.round((itemCount / totalSlotsInZone) * 100)`.

**Validates: Requirements 2.2**

### Property 6: Expiry alerts top-N selection

*For any* set of inventory items, the expiry alerts list should contain at most 5 items, all non-expired, sorted by ascending days-to-expiry, and no non-expired item outside the list should have fewer days-to-expiry than any item in the list.

**Validates: Requirements 2.3, 2.4**

### Property 7: Quick stats computation

*For any* set of inventory items, `totalCategories` should equal the count of unique category values, `expiredCount` should equal the count of items with status "Expired", and `avgDaysToExpiry` should equal the arithmetic mean of days-to-expiry for all non-expired items (or 0 if none exist).

**Validates: Requirements 2.5**

### Property 8: Avatar storage round-trip

*For any* valid base64 image string (starting with `data:image/(png|jpeg|webp);base64,` and ≤ 2MB), saving it via the profile API and then retrieving it should return the exact same string.

**Validates: Requirements 3.3, 8.4**

### Property 9: Image upload validation rejects invalid input

*For any* string that either (a) does not match the pattern `data:image/(png|jpeg|gif|webp);base64,...` or (b) exceeds 2,796,202 characters in length, the upload API should reject it with an error response and not persist any change.

**Validates: Requirements 3.4, 3.5, 5.4, 5.6, 8.5**

### Property 10: Notification unread count

*For any* array of notification objects, the computed `unreadCount` should equal the number of notifications where `isRead === false`.

**Validates: Requirements 4.1**

### Property 11: Mark all as read sets count to zero

*For any* array of notifications (with any mix of read/unread states), after calling `markAllAsRead()`, every notification should have `isRead === true` and the computed `unreadCount` should be 0.

**Validates: Requirements 4.3**

### Property 12: Adding unread notification increments count

*For any* notification state with `unreadCount = N`, adding a new notification with `isRead = false` should result in `unreadCount = N + 1`.

**Validates: Requirements 4.4**

### Property 13: Badge display formatting

*For any* non-negative integer `unreadCount`, the badge display should show: nothing when count is 0, the count as a string when 1 ≤ count ≤ 99, and "99+" when count > 99.

**Validates: Requirements 4.7**

### Property 14: Inventory detail card displays all required fields

*For any* inventory item object with all fields populated, the rendered detail card should contain the item's name, category, quantity, unit, location, dateIn, expiry, and status values.

**Validates: Requirements 5.2**

### Property 15: Inventory image storage round-trip

*For any* valid base64 image string (JPEG/PNG/WebP, ≤ 2MB), saving it to an inventory item and then retrieving that item should return the exact same image string.

**Validates: Requirements 5.5**

## Error Handling

### API Error Responses

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Invalid userId on GET /api/profile | 400 | `{ success: false, error: "userId parameter is required" }` |
| User not found | 404 | `{ success: false, error: "User not found" }` |
| Avatar exceeds 2MB | 400 | `{ success: false, error: "Avatar file size exceeds 2MB limit" }` |
| Invalid avatar format | 400 | `{ success: false, error: "Invalid image format. Supported: PNG, JPEG, WebP" }` |
| Invalid inventory image format | 400 | `{ success: false, error: "Invalid image format. Supported: JPEG, PNG, WebP" }` |
| Inventory image exceeds 2MB | 400 | `{ success: false, error: "Image file size exceeds 2MB limit" }` |
| Database connection failure | 500 | `{ success: false, error: "Internal server error" }` |

### Client-Side Error Handling

| Component | Error Scenario | Behavior |
|-----------|---------------|----------|
| Dashboard | API fetch fails | Show error card with retry button |
| FIFO page | Inventory fetch fails | Show error state with retry |
| Profile page | Avatar save fails | Show toast error, preserve previous avatar |
| Inventory page | Image upload fails | Show inline error in modal, preserve previous state |
| Notifications | Context initialization fails | Fallback to empty notifications array |

### File Upload Validation (Client-Side)

Before sending to the API, the client validates:
1. File type via `file.type` check against allowed MIME types
2. File size via `file.size` check against 2MB (2 * 1024 * 1024 bytes)
3. Display user-friendly error messages immediately without network round-trip

## Testing Strategy

### Property-Based Testing

**Library**: `fast-check` (JavaScript property-based testing library for Node.js/browser)

**Configuration**: Minimum 100 iterations per property test.

**Tag format**: `Feature: aromasys-app-improvements, Property {number}: {property_text}`

Properties to implement as PBT:
- Property 1–3: Pagination logic (pure functions: `getPageSlice`, `computePaginationInfo`)
- Property 4–7: Dashboard stat computations (pure functions: `computeWeeklyTrend`, `computeZoneSummary`, `computeExpiryAlerts`, `computeQuickStats`)
- Property 8–9: Avatar/image validation logic (pure function: `validateImageUpload`)
- Property 10–13: Notification state management (pure functions in NotificationContext)
- Property 14: Detail card rendering (component test with generated data)
- Property 15: Inventory image round-trip (API integration with generated data)

### Unit Tests (Example-Based)

- Landing page renders correct branding content
- Auth pages display overlay text with correct styling
- Profile page shows upload area and preview
- Audit trail shows avatar or initials
- Pagination controls disable at boundaries (page 1, last page)
- Pagination hides when ≤ 10 items or 0 items
- Modal opens on row click and closes on outside click / close button
- Dashboard shows loading and error states correctly

### Integration Tests

- Full avatar upload flow: select file → preview → save → verify in audit trail
- Notification sync: mark as read in notifications page → verify badge updates in topbar
- Dashboard data fetch → verify all sections render with live data
- Database migration: verify avatar and image columns exist after init-db

### Accessibility Testing

- All interactive elements have proper ARIA labels
- Modal traps focus and returns focus on close
- Color contrast ratio ≥ 4.5:1 for auth overlay text
- Pagination controls announce current page to screen readers

