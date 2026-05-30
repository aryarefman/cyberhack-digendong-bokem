# Design Document: App Polish and Features

## Overview

This feature set applies polish and completes missing functionality across the AromaSys WMS application. The changes span UI cleanup (removing tabs), new pages (Profile), new API routes (`/api/profile`, `/api/floor-plan-upload`), layout fixes, sidebar branding updates, and production-readiness improvements.

## Architecture

All changes follow the existing Next.js 15 App Router architecture with client components, Neon PostgreSQL via the `pg` package, and the established design token system in `globals.css`. The application uses a `(dashboard)` route group with a shared layout containing the Sidebar and topbar. New pages and API routes integrate into this existing structure without architectural changes.

## Components and Interfaces

### 1. Floor Plan Page Cleanup

**File:** `src/app/(dashboard)/digital-twin/floor-plan/page.js`

Remove the `digital-twin-tabs` div and all related imports/links. The sidebar already provides navigation to FIFO & Expiry and Cold-Chain Monitor pages.

```javascript
// REMOVE this entire block from FloorPlanPage:
// <div className="digital-twin-tabs">
//   <Link href="/digital-twin/floor-plan" className="dt-tab active">Interactive Floor Plan</Link>
//   <Link href="/digital-twin/fifo-expiry" className="dt-tab">FIFO & Expiry</Link>
//   <Link href="/digital-twin/cold-chain" className="dt-tab">Cold-Chain Monitor</Link>
// </div>
```

### 2. Floor Plan Upload Feature

**New Files:**
- `src/app/(dashboard)/digital-twin/floor-plan/upload/page.js` — Upload UI component
- `src/app/(dashboard)/digital-twin/floor-plan/upload/upload.css` — Styles
- `src/app/api/floor-plan-upload/route.js` — API route for file handling

**Component: FloorPlanUploadPage**

```javascript
'use client';
import { useState } from 'react';
import { Upload, FileImage, FileText, AlertCircle, Check } from 'lucide-react';

const ACCEPTED_IMAGE_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_PDF_FORMAT = 'application/pdf';
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function FloorPlanUploadPage() {
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedZones, setExtractedZones] = useState(null);

  function validateFile(file, acceptedFormats) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.`;
    }
    if (!acceptedFormats.includes(file.type)) {
      return `Unsupported format. Accepted formats: ${acceptedFormats.join(', ')}`;
    }
    return null;
  }

  // ... handlers for image selection, PDF selection, upload submission
}
```

**API Route: `/api/floor-plan-upload`**

```javascript
import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_PDF_TYPE = 'application/pdf';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const pdfFile = formData.get('pdf');

    // Validate image file
    if (imageFile) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Image file exceeds 10MB limit' },
          { status: 400 }
        );
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: 'Unsupported image format. Accepted: PNG, JPG, WEBP' },
          { status: 400 }
        );
      }
    }

    // Validate and process PDF with Gemini AI for zone extraction
    if (pdfFile) {
      if (pdfFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'PDF file exceeds 10MB limit' },
          { status: 400 }
        );
      }
      // Extract zone info using Gemini AI
      const zones = await extractZonesFromPDF(pdfFile);
      return NextResponse.json({ success: true, zones });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function extractZonesFromPDF(pdfFile) {
  const buffer = Buffer.from(await pdfFile.arrayBuffer());
  const base64 = buffer.toString('base64');

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Extract warehouse zone information from this floor plan PDF. Return JSON array with zone id, name, and position (x, y, width, height as percentages).' },
          { inlineData: { mimeType: 'application/pdf', data: base64 } }
        ]
      }]
    })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  // Parse JSON from Gemini response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}
```

### 3. Profile Page

**New Files:**
- `src/app/(dashboard)/settings/profile/page.js` — Profile page component
- `src/app/(dashboard)/settings/profile/profile.css` — Styles
- `src/app/api/profile/route.js` — Profile API route

**Component: ProfilePage**

```javascript
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { User, Key, Bell, Save, Check } from 'lucide-react';
import './profile.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'account');
  const [toast, setToast] = useState(null);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
  });

  function validatePasswordChange() {
    if (passwordData.newPassword !== passwordData.confirm) {
      setPasswordError('New password and confirmation do not match');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    // PUT /api/profile with updated data
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profileData, userId: user.id }),
    });
    const data = await res.json();
    if (data.success) {
      setToast('Profile updated successfully');
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!validatePasswordChange()) return;
    // PUT /api/profile with password change
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        currentPassword: passwordData.current,
        newPassword: passwordData.newPassword,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setToast('Password changed successfully');
      setPasswordData({ current: '', newPassword: '', confirm: '' });
    }
  }

  // Render tabs: Account, Password, Notifications
  // ...
}
```

**API Route: `/api/profile`**

```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {
    const res = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [userId]
    );
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, email, currentPassword, newPassword } = body;

    if (newPassword) {
      // Password change flow
      const userRes = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      if (userRes.rows[0].password !== currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
    } else {
      // Profile update flow
      await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, userId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 4. Sidebar Logo Update

**File:** `src/components/Sidebar.js`

Update the `.sidebar-logo` section to match the Figma design (file key `T5U7kGTIeNrVnykNSRmKHv`). Replace the current "AS" monogram, "AromaSys" text, and "SIMA AROME" subtitle with the correct branding elements from Figma.

```javascript
// Updated sidebar logo section
<div className="sidebar-logo">
  <Link href="/dashboard" className="sidebar-logo-link">
    <div className="sidebar-logo-icon">
      {/* Replace with Figma-specified monogram/icon */}
    </div>
    <div className="sidebar-logo-text">
      <h1>{/* Figma-specified app name */}</h1>
      <span className="sidebar-brand-sub">{/* Figma-specified tagline */}</span>
    </div>
  </Link>
</div>
```

### 5. Layout and Spacing Fixes

**Files affected:**
- `src/app/globals.css` — Add/update spacing utilities
- `src/app/(dashboard)/copilot/report/report.css` — Fix overflow
- All page CSS files — Ensure consistent spacing

**Key CSS changes:**

```css
/* Ensure page headers have consistent spacing */
.page-header {
  margin-bottom: var(--space-6); /* 24px minimum */
}

/* Prevent card overflow */
.card {
  max-width: 100%;
  overflow: hidden;
}

/* Content area overflow protection */
.content-area {
  overflow-x: hidden;
}

/* Responsive grid reflow for < 1280px */
@media (max-width: 1279px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
```

### 6. Production-Ready Improvements

**Search functionality:** Add functional search to the topbar that filters sidebar navigation items or displays a "Search coming soon" placeholder badge.

**Error handling:** Wrap all API calls in try/catch with user-friendly error messages and database connection failure handling.

**Form validation:** Add client-side validation to all forms before API submission:
- Required field checks
- Email format validation
- Password match validation
- Numeric range validation for quantities

## Interfaces

### API: `/api/floor-plan-upload`

| Method | Description | Request | Response |
|--------|-------------|---------|----------|
| POST | Upload floor plan image and/or PDF | `multipart/form-data` with `image` and/or `pdf` fields | `{ success: boolean, zones?: Zone[], imageUrl?: string, error?: string }` |

**Zone type:**
```typescript
interface Zone {
  id: string;
  name: string;
  position: {
    x: number;      // percentage (0-100)
    y: number;      // percentage (0-100)
    width: number;  // percentage (0-100)
    height: number; // percentage (0-100)
  };
}
```

### API: `/api/profile`

| Method | Description | Request | Response |
|--------|-------------|---------|----------|
| GET | Get user profile | Query: `?userId=<id>` | `{ success: boolean, user: { id, name, email, role } }` |
| PUT | Update profile or password | JSON body (see below) | `{ success: boolean, error?: string }` |

**PUT body for profile update:**
```json
{ "userId": 1, "name": "New Name", "email": "new@email.com" }
```

**PUT body for password change:**
```json
{ "userId": 1, "currentPassword": "old", "newPassword": "new" }
```

### File Validation Interface

```javascript
/**
 * Validates an uploaded file against size and format constraints.
 * @param {File} file - The file to validate
 * @param {string[]} acceptedFormats - Array of accepted MIME types
 * @param {number} maxSizeBytes - Maximum file size in bytes
 * @returns {string|null} Error message or null if valid
 */
function validateFile(file, acceptedFormats, maxSizeBytes) {
  if (file.size > maxSizeBytes) {
    return `File size exceeds ${maxSizeBytes / (1024 * 1024)}MB limit.`;
  }
  if (!acceptedFormats.includes(file.type)) {
    return `Unsupported format. Accepted: ${acceptedFormats.join(', ')}`;
  }
  return null;
}
```

## Data Models

### Existing Tables (unchanged)

- `users` — id, name, email, password, role
- `inventory` — id, name, category, qty, unit, location, zone, date_in, expiry, status
- `slots` — id, zone, row, col, occupied, item_id
- `temperature_readings` — id, zone, hour, temperature, timestamp
- `audit_logs` — id, timestamp, username, role, action, detail, module

### New: Floor Plan Storage (client-side)

Floor plan images and extracted zone data are stored in the browser's localStorage or as state managed by the floor plan page. No new database table is required since the floor plan image is rendered client-side and zone positions overlay the existing ROOMS array.

```javascript
// localStorage key: 'aromasys_floor_plan'
{
  imageDataUrl: string,       // Base64 data URL of uploaded image
  zones: Zone[],              // Extracted zone positions from PDF
  uploadedAt: string          // ISO timestamp
}
```

### Profile Update (uses existing `users` table)

No schema changes needed. The `/api/profile` route reads and updates the existing `users` table columns: `name`, `email`, `password`.

## Error Handling

### Client-Side Validation

All forms perform validation before submission:

1. **Floor Plan Upload:**
   - File size check (> 10MB → error)
   - File format check (not in accepted list → error with accepted formats)
   - Empty file selection → disabled submit button

2. **Profile Page:**
   - Empty name/email → required field error
   - Invalid email format → format error
   - Password mismatch → "Passwords do not match" error
   - Password too short (< 6 chars) → length error

3. **Inventory Forms (existing):**
   - Empty required fields → prevent submission
   - Invalid quantity (non-numeric, <= 0) → validation error

### Server-Side Error Handling

All API routes follow this pattern:

```javascript
try {
  // Business logic
  return NextResponse.json({ success: true, data });
} catch (error) {
  console.error('Context:', error);
  return NextResponse.json(
    { success: false, error: error.message },
    { status: 500 }
  );
}
```

**HTTP Status Codes:**
- `200` — Success
- `400` — Client error (validation failure, bad request)
- `404` — Resource not found
- `500` — Server error (database failure, unexpected error)

### Database Connection Failure

When `pool.query()` throws a connection error, the API returns a 500 response. The client displays a user-friendly message:

```javascript
// Client-side error handling pattern
try {
  const res = await fetch('/api/...');
  const data = await res.json();
  if (!data.success) {
    setError(data.error || 'An error occurred');
  }
} catch (err) {
  setError('Unable to connect to the server. Please try again later.');
}
```

## Testing Strategy

**Unit Tests (example-based):**
- Floor Plan Page renders without digital-twin-tabs element
- Upload page accepts valid image formats (PNG, JPG, WEBP)
- Profile page renders user data (avatar, name, email, role)
- Profile page shows password tab when `?tab=password` query param is present
- API routes return correct HTTP status codes for success and error cases
- Sidebar logo displays correct branding elements

**Integration Tests:**
- Floor plan PDF upload extracts zones via Gemini AI (mocked)
- Profile API reads/updates user data in PostgreSQL
- CRUD operations persist to database and return updated state

**Property Tests:**
- File validation logic (size and format constraints)
- Form validation prevents invalid submissions
- Layout containment (no overflow)
- Accessibility properties (touch targets, color contrast)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Upload file validation rejects invalid files

*For any* file with size greater than 10MB OR with a MIME type not in the accepted formats list (PNG, JPG, WEBP for images; PDF for metadata), the `validateFile` function SHALL return a non-null error message string, and the upload SHALL NOT proceed.

**Validates: Requirements 2.7, 2.8**

### Property 2: Layout containment — no card overflow

*For any* card element (`.card`) rendered on any dashboard page, the card's bounding rectangle SHALL be fully contained within its parent container's bounding rectangle, with no horizontal or vertical overflow.

**Validates: Requirements 3.2, 3.4, 3.5**

### Property 3: Form client-side validation prevents invalid submissions

*For any* form in the application, submitting with invalid data (empty required fields, mismatched passwords, invalid email format) SHALL display a validation error message and SHALL NOT trigger an API request to the server.

**Validates: Requirements 5.8, 6.6**

### Property 4: Loading state indicators during data fetch

*For any* page that performs a data-fetching operation, while the fetch is in progress (loading state is true), the page SHALL display a loading indicator (spinner or skeleton element) and SHALL NOT display empty content or a blank area.

**Validates: Requirements 7.6**

### Property 5: Interactive element touch target size

*For any* interactive element (button, link, clickable card, input) rendered in the application, its computed dimensions SHALL be at least 44x44 pixels to meet accessibility touch target requirements.

**Validates: Requirements 7.7**

### Property 6: Color contrast accessibility

*For any* text element rendered in the application, the contrast ratio between its computed text color and its computed background color SHALL be at least 4.5:1 for normal text (below 18px or below 14px bold).

**Validates: Requirements 7.8**
