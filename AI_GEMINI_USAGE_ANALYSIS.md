# AromaSys AI/Gemini Usage Pattern Analysis

## Comprehensive AI Feature Inventory

| # | File Path | Feature Name | AI Task Type | Implementation Type | Context Data Passed | Model Configuration | Status |
|---|-----------|--------------|--------------|---------------------|----------------------|----------------------|--------|
| 1 | `frontend/src/lib/gemini.ts` | **Core AI Utility** | N/A | Batch with fallback chain | N/A | Centralized config with 4 task types | ✅ Active |
| 2 | `frontend/src/app/(dashboard)/data-ingestion/page.tsx` | **OCR Data Extraction** | `ocr` | Individual hardcoded prompt | Base64 image/PDF file | `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` | ✅ Active |
| 3 | `frontend/src/app/(dashboard)/qc/page.tsx` | **Quality Control Inspection** | `qc` | Individual hardcoded prompt | Base64 JPEG image from camera/upload | `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` | ✅ Active |
| 4 | `frontend/src/app/(dashboard)/floor-plan/AIRecommendationPanel.tsx` | **AI Warehouse Placement Recommendations** | `floor-plan` | Batch context with full DB + temperature data | Inventory items, slots, temperature readings, zone names, custom zones | `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` | ✅ Active |
| 5 | `backend/src/routes/floor-plan-upload.js` | **Floor Plan AI Zone Detection** | `floor-plan` | Batch with PDF + image analysis | Floor plan image/PDF as base64 | `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` | ✅ Active |
| 6 | `frontend/src/app/(dashboard)/auto-report/page.tsx` | **Automated Warehouse Report** | `chatbot` | Individual hardcoded prompt | Inventory metrics, stock levels, expiry dates, slot occupancy | `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` | ✅ Active |
| 7 | `frontend/src/components/ChatbotOverlay.tsx` | **Chatbot Overlay (Navbar)** | `chatbot` | Individual hardcoded prompt | Zones, inventory, slots, temperature data, user messages | `gemini-2.5-flash-lite` → `gemini-2.0-flash-lite` → `gemini-2.5-flash` → `gemini-2.0-flash` | ✅ Active |

---

## Detailed Feature Breakdown

### 1. Core AI Utility (`frontend/src/lib/gemini.ts`)
**Purpose:** Centralized Gemini API integration layer for all AI features

**Key Functions:**
- `callAI(prompt, taskType, imageBase64?, mimeType?)` - Main public API with task-specific fallback chains
- `callGemini(prompt, imageBase64?, mimeType?)` - Backward-compatible wrapper (uses 'chatbot' task type)
- `callModel()` - Internal model caller with automatic fallback on error

**Configuration:**
```
Task Type      | Model Chain (Priority Order)
floor-plan     | gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
ocr            | gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
chatbot        | gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
qc             | gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
```

**Response Format:** JSON for structured tasks (floor-plan, ocr, qc); Plain text for chatbot

---

### 2. Data Ingestion - OCR Processing (`frontend/src/app/(dashboard)/data-ingestion/page.tsx`)

**Feature Type:** Individual file OCR extraction

**AI Integration:**
```javascript
callAI(OCR_PROMPT, 'ocr', base64Data, mimeType)
```

**Hardcoded Prompt:**
```
Extract inventory/material data from this document image. 
Return JSON array where each item has: name, category (one of 9 predefined),
qty, unit, lotNumber, location, expiry (YYYY-MM-DD), confidence (0-1).
Return ONLY the JSON array.
```

**Context Data:**
- Document image/PDF (base64 encoded)
- File MIME type (image/jpeg, image/png, application/pdf)

**Processing:**
- Individual file processing (one AI call per file)
- Parses JSON response
- Normalizes confidence scores (0-1 range)
- Performs duplicate detection against existing inventory

**No Batch Processing** - Each file processed individually

---

### 3. Quality Control - Material Inspection (`frontend/src/app/(dashboard)/qc/page.tsx`)

**Feature Type:** Individual image-based quality inspection

**AI Integration:**
```javascript
callAI(prompt, "qc", imageBase64, "image/jpeg")
```

**Hardcoded Prompt:**
```
Analyze this [fruit-raw OR extract/powder] image for QC inspection.
Determine if material passes/fails quality standards.
Consider: color consistency, texture, defects, contamination, freshness.
Respond in JSON: { "result": "pass"|"fail", "confidence": 0-100, "notes": "..." }
Return ONLY JSON object.
```

**Context Data:**
- Camera capture OR file upload (JPEG base64)
- Material type: fruit-raw OR extract-powder
- Material/Batch ID (user input)

**Output:**
- Pass/fail determination
- Confidence score (0-100)
- Detailed assessment notes

**Fallback:** Manual QC form if AI unavailable

---

### 4. Floor Plan - AI Placement Recommendations (`frontend/src/app/(dashboard)/floor-plan/AIRecommendationPanel.tsx`)

**Feature Type:** Batch analysis with full context (MOST COMPREHENSIVE AI USAGE)

**AI Integration:**
```javascript
callAI(batchPrompt, 'floor-plan')
```

**Batch Processing:**
- Analyzes multiple issues in ONE Gemini call
- Detects zone mismatches (rule-based first)
- Detects stock rotation issues (rule-based first)
- Passes all raw issues to Gemini for analysis enrichment

**Context Data Passed to Gemini:**
1. **Real-time Temperature Sensor Data** (per zone)
   - Current zone: real-time temperature reading
   - Zone temperature range (ideal min-max)

2. **Database Inventory Items**
   - Item name, category, quantity, unit
   - Expiry date, current status
   - Current location (zone/slot)

3. **Slot/Zone Occupancy**
   - DB slots with occupancy status
   - Custom floor plan zones with assigned materials
   - Zone names and IDs

4. **Category-Zone Mapping Rules**
   - Scientific reasoning for optimal zone placement
   - Temperature sensitivity by category (Susu, Cokelat, Kimia, Tepung, Gula, Minyak, Pewarna, Essence, Rempah)

**Prompt Structure:**
```
Analyzes ${rawIssues.length} inventory problems:
- MISMATCH issues: item in wrong temp zone (dangerous)
- ROTATION issues: expired/critical items needing immediate action

For each issue, requests:
1. Scientific explanation of danger
2. Specific risk factors with numbers
3. Why target zone is better
4. Urgency assessment

Returns JSON array: [{"id": "issue_id", "analysis": "detailed_text"}]
```

**No Hardcoding** - Uses dynamic issue list + real-time temperature data

**Fallback:** Rule-based explanations if AI fails

---

### 5. Floor Plan Upload - Zone Detection (`backend/src/routes/floor-plan-upload.js`)

**Feature Type:** Backend batch processing for floor plan analysis

**AI Integration:**
```javascript
callGeminiWithFallback(contents, generationConfig)
```

**Processing:**
- Image-only analysis → `extractZonesFromImage()`
- Image + PDF analysis → `extractZonesFromImageAndPDF()` (enhanced)

**Context Data:**
- Floor plan image (base64)
- Optional PDF document (base64)
- Model fallback: gemini-2.5-flash → gemini-2.0-flash → gemini-1.5-flash

**Hardcoded Prompt:**
```
Analyze floor plan and extract all warehouse zones.
Return ONLY valid JSON array (no markdown).
Each zone must have: id, name, position (x,y,width,height as 0-100%)

Example format: [{"id": "zone-a", "name": "Storage Area A", "position": {...}}]
```

**Response Format:** JSON array with zone structure

**Model Requirement:** `responseMimeType: 'application/json'` enforced

---

### 6. Auto Report - Warehouse Analysis (`frontend/src/app/(dashboard)/auto-report/page.tsx`)

**Feature Type:** Individual prompt-based report generation

**AI Integration:**
```javascript
callAI(prompt, 'chatbot')
```

**Hardcoded Prompt Template:**
```
Kamu adalah AI analis gudang AromaSys. Berikan analisis singkat (3-5 kalimat) 
dalam Bahasa Indonesia tentang kondisi gudang berdasarkan metrik berikut:
- Total stok: ${totalStock} kg/L
- Item low stock/kritis: ${lowStockCount} item
- Slot terpakai: ${occupiedSlots} dari ${totalSlots}
- Batch mendekati kedaluwarsa (7 hari): ${nearExpiry} batch
- Total item terkelola: ${inventory.length}
- Periode laporan: ${startDate} sampai ${endDate}
- Jenis laporan: ${selectedType}

Berikan rekomendasi operasional yang actionable.
```

**Context Data:**
- Inventory list (item count, status, expiry)
- Slot occupancy (occupied vs total)
- Date range (startDate, endDate)
- Report type (daily, weekly, monthly)
- Near-expiry batch count

**Language:** Indonesian (hardcoded in prompt)

**Output:** Short warehouse analysis + actionable recommendations

---

### 7. Chatbot Overlay - Conversational AI (`frontend/src/components/ChatbotOverlay.tsx`)

**Feature Type:** Live database context + conversational

**AI Integration:**
```javascript
callGemini(prompt)
// Internally calls callAI(prompt, 'chatbot')
```

**Context Data Assembly:**
```javascript
const systemPrompt = `You are Aro, the AromaSys AI Copilot...
LIVE DATABASE (JSON):
- Categories: ${CATEGORIES}
- Zones: ${zones with temp ranges}
- Inventory: ${compact inventory list}
- Slots: ${slot occupancy with item names}
- Cold-Chain Temps: ${current temperature readings}
- Plus 8 data formatting rules for tables/reports
`;
```

**Context Data Passed:**
1. **Zones Data**
   - Zone ID, name, type, temperature min/max

2. **Inventory Data** (compacted)
   - Name, category, qty, unit, status, expiry

3. **Slot Data** (compacted)
   - Slot ID, zone, occupancy status, item name

4. **Temperature Data**
   - Current readings per zone

5. **System Instructions**
   - Table formatting requirements
   - Report generation rules
   - Language detection for multilingual support

**Model Chain:** 
- `gemini-2.5-flash-lite` (first try)
- `gemini-2.0-flash-lite` (fallback)
- `gemini-2.5-flash` (fallback)
- `gemini-2.0-flash` (last resort)

**Output:** Markdown formatted responses with tables/lists

**Features:**
- Supports PDF report download
- Markdown rendering with tables
- Multi-language responses
- Quick insight cards with predefined prompts

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total AI Features** | 7 |
| **Task Types** | 4 (floor-plan, ocr, chatbot, qc) |
| **Files with AI Implementation** | 7 |
| **Individual (Hardcoded) Prompts** | 6 |
| **Batch Context Implementations** | 2 (Floor Plan Recommendations, Chatbot) |
| **Backend AI Routes** | 1 |
| **Model Fallback Chains** | Yes (3-4 models per task) |
| **JSON Response Formats** | 3 (OCR, QC, Floor Plan) |
| **Context Data Sources** | Database + Real-time sensors |

---

## Context Data Usage by Feature

### Heavy Context (Batch Processing)
✅ **Floor Plan Recommendations** - Uses full DB + temperature data + zone mappings
✅ **Chatbot Overlay** - Uses zones, inventory, slots, temperatures

### Moderate Context
⚠️ **Auto Report** - Uses computed metrics (stock totals, counts)
⚠️ **Floor Plan Upload (Backend)** - Uses floor plan image data

### Minimal Context (File-Based)
❌ **Data Ingestion OCR** - Only file image/PDF
❌ **Quality Control** - Only product image
❌ **Floor Plan Upload (Frontend)** - Only floor plan image

---

## Implementation Patterns

### Pattern 1: Individual Hardcoded Prompts
Files: `data-ingestion`, `qc`, `auto-report`, `chatbot-overlay`
- Simple, independent prompts
- Easy to modify per feature
- Less database integration

### Pattern 2: Batch Context + AI Enrichment
Files: `floor-plan/AIRecommendationPanel.tsx`
- Rule-based detection first
- Gemini used for explanation enrichment
- Single batch call for multiple items
- Most efficient use of API

### Pattern 3: Backend Processing
Files: `backend/src/routes/floor-plan-upload.js`
- Heavy file processing (PDFs)
- Server-side handling for security
- Consistent with Express backend architecture

---

## Error Handling & Fallbacks

| Feature | AI Unavailable Fallback |
|---------|------------------------|
| Data Ingestion OCR | Show error, allow manual data entry |
| QC Inspection | Show manual inspection form |
| Floor Plan Recommendations | Use rule-based explanations only |
| Auto Report | Cached analysis or error message |
| Chatbot | Graceful error message to user |
| Floor Plan Upload | Error card with retry button |

---

## Model Configuration Details

### Primary Models Used
1. **gemini-2.5-flash** (Latest, primary)
2. **gemini-2.0-flash** (Fallback 1)
3. **gemini-1.5-flash** (Fallback 2)
4. **gemini-2.5-flash-lite** / **gemini-2.0-flash-lite** (For chatbot overlay)

### Task-Specific Chains
```
floor-plan:  2.5-flash → 2.0-flash → 1.5-flash
ocr:         2.5-flash → 2.0-flash → 1.5-flash
chatbot:     2.5-flash-lite → 2.0-flash-lite → 2.5-flash → 2.0-flash
qc:          2.5-flash → 2.0-flash → 1.5-flash
```

### JSON Mode Enforcement
- Enabled for: `floor-plan`, `ocr`, `qc` tasks
- Disabled for: `chatbot` (plain text/markdown)
- Configuration: `responseMimeType: 'application/json'`

---

## API Key Configuration

**Frontend:**
- `process.env.NEXT_PUBLIC_GEMINI_API_KEY` (exposed to client)

**Backend:**
- Primary: `process.env.GEMINI_API_KEY`
- Fallback: `process.env.NEXT_PUBLIC_GEMINI_API_KEY`

---

## Batch vs Individual Processing

### Batch Processing (Efficient)
✅ Floor Plan Recommendations - One API call for 5+ issues
✅ Chatbot - Single call per user message

### Individual Processing (Wasteful)
❌ Data Ingestion - One API call per file
❌ QC Inspection - One API call per product
❌ Auto Report - One API call per report generation

**Recommendation:** Consider combining OCR files into batch processing for cost efficiency.

---

## Context Data Quality Assessment

| Data Type | Source | Real-time | Accuracy |
|-----------|--------|-----------|----------|
| Inventory | PostgreSQL DB | Yes | High |
| Slots | PostgreSQL DB | Yes | High |
| Temperatures | Cold Chain Sensors | Real-time | Medium-High |
| Floor Plan Zones | DB + User Upload | On-demand | Medium |
| Product Images | Camera/Upload | Per-action | High |
| Floor Plan Images | User Upload | On-demand | High |

---

## Performance Considerations

1. **Batch Recommendations** - Most efficient (1 call for many items)
2. **Chatbot** - Per-message call (unavoidable)
3. **OCR** - Could be optimized to batch files
4. **QC** - Single inspection, acceptable
5. **Auto Report** - Single call, acceptable
6. **Floor Plan Upload** - Backend processing, acceptable

**Bottleneck:** Individual file processing in data ingestion (should batch if file count is high).

---

## Language Support

| Feature | Languages Supported |
|---------|---------------------|
| Data Ingestion | Hardcoded Indonesian prompts |
| QC Inspection | Hardcoded Indonesian/English mixed |
| Floor Plan Recommendations | Hardcoded Indonesian |
| Auto Report | Hardcoded Indonesian |
| Chatbot Overlay | Dynamic (detects user language) |
| Floor Plan Upload | English hardcoded |

**Note:** ChatbotOverlay implements language detection via user input language matching.

---

## Recommendations

1. **Consolidate OCR Processing** - Implement batch OCR for multiple files
2. **Cache Common Analyses** - Store floor plan recommendation results
3. **Add Monitoring** - Track API failures and fallback usage
4. **Optimize Model Selection** - Use lite models for simple tasks
5. **Add Rate Limiting** - Prevent abuse of free tier quotas
6. **Document Prompts** - Create prompt versioning/management system

