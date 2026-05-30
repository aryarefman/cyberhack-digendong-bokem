# Requirements Document

## Introduction

Full application polish for the AromaSys (SIMA AROME) warehouse management system. This specification covers bug fixes, UI alignment with the Hikari branch design, ensuring all AI-powered features (floor plan analysis, OCR data ingestion, AI recommendations) are functional and dynamic, making all buttons and features production-ready, and cleaning up the dashboard layout. The system uses Next.js 16 + React 19 frontend with an Express 5 + PostgreSQL backend, powered by Google Gemini (gemini-2.5-flash) for AI capabilities.

## Glossary

- **Application**: The AromaSys (SIMA AROME) warehouse management web application consisting of a Next.js frontend and Express backend
- **Dashboard**: The main overview page at `/overview` displaying summary cards, charts, and zone information
- **Floor_Plan_Page**: The interactive floor plan page at `/floor-plan` that displays warehouse zones and allows material placement
- **Data_Ingestion_Page**: The page at `/data-ingestion` that handles OCR scanning of documents and extraction of inventory data
- **Gemini_AI**: The Google Gemini 2.5 Flash model used for OCR extraction, floor plan analysis, and AI recommendations
- **Hikari_Design**: The reference design implementation stored in `frontend/hikari_*.txt` files representing the target UI/UX
- **Floor_Plan_Upload**: The feature allowing users to upload an image of a warehouse floor plan for AI zone detection
- **AI_Recommendation**: The dynamic suggestion system that recommends material placement based on zone classification and inventory state
- **OCR_Engine**: The Gemini-based optical character recognition system that extracts inventory data from uploaded documents
- **Chatbot**: The AI production copilot accessible from the navbar for warehouse-related queries
- **Backend_API**: The Express 5 server providing REST endpoints for inventory, slots, audit, and floor plan operations
- **Zone**: A designated area within the warehouse floor plan with specific storage classification (e.g., Cold Storage, Hazard Storage)

## Requirements

### Requirement 1: Dashboard Layout Alignment

**User Story:** As a warehouse operator, I want the dashboard to display a clean, organized layout matching the Hikari design, so that I can quickly access key metrics and information.

#### Acceptance Criteria

1. THE Application SHALL render the Dashboard page with a grid layout matching the Hikari_Design reference including summary stat cards, weekly stock trend chart, and zone summary cards.
2. WHEN the Dashboard page loads, THE Application SHALL fetch live data from the Backend_API for inventory counts, zone capacities, cold-chain alerts, and FIFO expiry warnings.
3. THE Application SHALL display the WeeklyStockChart component using Recharts LineChart with proper axis labels, tooltips, and responsive sizing as defined in the Hikari_Design.
4. THE Application SHALL display ZoneSummaryCards showing each zone's item count and capacity percentage with color-coded indicators.
5. THE Application SHALL apply consistent spacing, typography (Poppins font family), and color scheme (#2C742F primary, #D7E5D8 background, #1C1B1F text) across all dashboard components.

### Requirement 2: Authentication Page UI Fix

**User Story:** As a user, I want the sign-in and sign-up pages to have properly centered navigation elements, so that the interface looks professional and polished.

#### Acceptance Criteria

1. THE Application SHALL render the back arrow button on the login page vertically and horizontally centered within its container element.
2. THE Application SHALL render the back arrow button on the register page vertically and horizontally centered within its container element.
3. THE Application SHALL maintain consistent alignment of the back arrow across all viewport sizes from mobile (320px) to desktop (1920px).

### Requirement 3: Floor Plan AI Image Analysis

**User Story:** As a warehouse manager, I want to upload a floor plan image and have AI automatically detect and generate editable zones, so that I can quickly digitize my warehouse layout.

#### Acceptance Criteria

1. WHEN a user uploads a floor plan image (PNG, JPG, or WEBP), THE Floor_Plan_Page SHALL send the image to Gemini_AI for zone detection analysis.
2. WHEN Gemini_AI completes the analysis, THE Floor_Plan_Page SHALL auto-generate interactive zones on the canvas based on the detected areas with position coordinates (x, y, width, height as percentages).
3. THE Floor_Plan_Page SHALL display the uploaded image as the background of the interactive canvas area.
4. WHERE a PDF document is also uploaded alongside the image, THE Floor_Plan_Page SHALL send both files to the Backend_API for enhanced zone detection combining visual and textual data.
5. IF Gemini_AI fails to analyze the uploaded image, THEN THE Floor_Plan_Page SHALL display an error message and allow the user to retry the upload.
6. WHEN zone detection completes, THE Floor_Plan_Page SHALL assign default zone names and classifications based on the AI analysis output.

### Requirement 4: Floor Plan Editability

**User Story:** As a warehouse manager, I want to drag, resize, add, edit, and delete zones on the floor plan, so that I can customize the layout to match my actual warehouse configuration.

#### Acceptance Criteria

1. WHEN a user drags a zone on the canvas, THE Floor_Plan_Page SHALL update the zone position in real-time following the pointer movement.
2. WHEN a user resizes a zone using edge handles (top, bottom, left, right), THE Floor_Plan_Page SHALL update the zone dimensions while enforcing a minimum size of 5% width and 5% height.
3. WHEN a user clicks "Add Zone", THE Floor_Plan_Page SHALL create a new zone with default position and open the zone details modal for configuration.
4. WHEN a user edits a zone through the ZoneDetailsModal, THE Floor_Plan_Page SHALL save the zone name, sensor configuration, and assigned materials to localStorage.
5. WHEN a user deletes a zone, THE Floor_Plan_Page SHALL remove the zone from the canvas and update localStorage.
6. THE Floor_Plan_Page SHALL enforce a maximum limit of 30 custom zones per floor plan.
7. THE Floor_Plan_Page SHALL persist all zone configurations (positions, names, materials) across page reloads using localStorage.

### Requirement 5: Dynamic AI Recommendations on Floor Plan

**User Story:** As a warehouse operator, I want AI recommendations to update dynamically when the floor plan or inventory changes, so that I always receive relevant placement suggestions.

#### Acceptance Criteria

1. WHEN a user selects an empty slot on the floor plan, THE Floor_Plan_Page SHALL generate an AI recommendation based on the most recent inventory intake item and the selected zone classification.
2. WHEN the inventory state changes (item added or removed), THE Floor_Plan_Page SHALL recalculate AI recommendations for all visible slots.
3. WHEN a user applies an AI recommendation, THE Floor_Plan_Page SHALL write the placement to the Backend_API and update the floor plan display.
4. THE Floor_Plan_Page SHALL display zone mismatch warnings when items are placed in zones that do not match their category classification (e.g., cold items outside Cold Storage).
5. WHEN the floor plan layout changes (zones added, removed, or repositioned), THE Floor_Plan_Page SHALL regenerate recommendations based on the updated zone configuration.

### Requirement 6: Data Ingestion OCR Functionality

**User Story:** As a warehouse operator, I want to upload delivery notes and invoices and have AI accurately extract inventory data, so that I can digitize incoming shipments without manual data entry.

#### Acceptance Criteria

1. WHEN a user uploads an image file (JPG, PNG) or PDF, THE Data_Ingestion_Page SHALL send the file content to Gemini_AI with the OCR extraction prompt.
2. WHEN Gemini_AI returns extracted data, THE Data_Ingestion_Page SHALL display the results in an editable table with columns: name, category, quantity, unit, lot number, location slot, expiry date, and confidence score.
3. THE Data_Ingestion_Page SHALL use the configured Gemini API key (NEXT_PUBLIC_GEMINI_API_KEY environment variable) for all AI requests.
4. WHEN a user edits an extracted row, THE Data_Ingestion_Page SHALL update the item data in the local state and reflect changes in the table immediately.
5. WHEN a user clicks "Save All to Inventory", THE Data_Ingestion_Page SHALL post each extracted item to the Backend_API inventory endpoint with proper zone assignment.
6. IF Gemini_AI returns an error or empty result, THEN THE Data_Ingestion_Page SHALL display a descriptive error message indicating the failure reason.
7. THE Data_Ingestion_Page SHALL support processing multiple files in a single upload session, accumulating results in the extraction table.
8. WHEN a file is processed, THE Data_Ingestion_Page SHALL log the upload record (file name, size, category, record count, status, timestamp) to the ingestion history.

### Requirement 7: Data Ingestion Split and Duplicate Detection

**User Story:** As a warehouse operator, I want the system to detect duplicate entries and allow me to split large uploads, so that I avoid data inconsistencies in the inventory.

#### Acceptance Criteria

1. WHEN extracted items are displayed, THE Data_Ingestion_Page SHALL check each item against existing inventory records in the Backend_API for potential duplicates based on name and lot number.
2. WHEN a duplicate is detected, THE Data_Ingestion_Page SHALL display a warning indicator on the affected row with the matching existing item details.
3. THE Data_Ingestion_Page SHALL allow users to delete individual extracted rows before saving to inventory.
4. WHEN multiple files are uploaded, THE Data_Ingestion_Page SHALL process each file sequentially and merge results into a single extraction table.

### Requirement 8: Chatbot Integration via Navbar

**User Story:** As a warehouse operator, I want to access the AI chatbot from the navbar instead of a floating button, so that the interface remains clean and the chatbot is consistently accessible.

#### Acceptance Criteria

1. THE Application SHALL display the chatbot access button in the top navigation bar as a Bot icon button.
2. THE Application SHALL NOT display a floating chatbot button at the bottom of the screen.
3. WHEN a user clicks the chatbot button in the navbar, THE Application SHALL open the ChatbotOverlay component as a slide-in panel.
4. WHEN a user sends a message in the chatbot, THE Application SHALL forward the message to Gemini_AI and display the response in the chat interface.
5. THE Chatbot SHALL maintain conversation history within the current session.

### Requirement 9: UI Design Consistency with Hikari Branch

**User Story:** As a user, I want all pages to follow a consistent visual design matching the Hikari branch, so that the application feels cohesive and professional.

#### Acceptance Criteria

1. THE Application SHALL use the color palette defined in the Hikari_Design: primary green (#2C742F), background sage (#D7E5D8), accent lime (#AAE970), text dark (#1C1B1F), text secondary (#79747E).
2. THE Application SHALL apply Tailwind CSS for layout and spacing with CSS modules for complex component styling across all pages.
3. THE Application SHALL use Framer Motion for page transitions, modal animations, and interactive element feedback consistently across all pages.
4. THE Application SHALL render the sidebar navigation with grouped menu items (MAIN, WAREHOUSE, PRODUCTION, SETTINGS) matching the Hikari_Design layout.
5. THE Application SHALL display responsive layouts that adapt from mobile (320px) to desktop (1920px) without layout breakage.
6. WHERE features exist in the Hikari branch but not in the frontend branch, THE Application SHALL retain those features with styling matching the Hikari_Design.

### Requirement 10: All Buttons and Features Functional

**User Story:** As a user, I want every button and interactive element in the application to perform its intended action, so that the application is production-ready and not merely decorative.

#### Acceptance Criteria

1. WHEN a user clicks any navigation link in the sidebar, THE Application SHALL route to the corresponding page without errors.
2. WHEN a user clicks action buttons (Add, Edit, Delete, Save, Export), THE Application SHALL execute the corresponding CRUD operation against the Backend_API.
3. WHEN a user interacts with form inputs (dropdowns, text fields, date pickers), THE Application SHALL update the component state and validate input according to field constraints.
4. IF a Backend_API request fails, THEN THE Application SHALL display a user-friendly error message with the failure reason and allow retry.
5. WHEN a user triggers a data-modifying action, THE Application SHALL reflect the change in the UI immediately (optimistic update) or after confirmation from the Backend_API.
6. THE Application SHALL disable buttons during async operations (loading state) to prevent duplicate submissions.

### Requirement 11: API Routing Architecture

**User Story:** As a developer, I want heavy AI processing to route through the backend while lightweight AI calls go directly from the frontend, so that the application balances performance and security.

#### Acceptance Criteria

1. WHEN the Floor_Plan_Upload processes an image with PDF, THE Application SHALL send the request to the Backend_API endpoint `/api/floor-plan-upload` for server-side Gemini processing.
2. WHEN the Chatbot sends a message or the AI_Recommendation generates suggestions, THE Application SHALL call Gemini_AI directly from the frontend using the configured API key.
3. WHEN the OCR_Engine processes uploaded documents, THE Application SHALL call Gemini_AI directly from the frontend for lightweight single-file extraction.
4. THE Backend_API SHALL handle file uploads using Multer middleware with appropriate file size limits.
5. THE Application SHALL store the Gemini API key in the `NEXT_PUBLIC_GEMINI_API_KEY` environment variable for frontend direct calls.
