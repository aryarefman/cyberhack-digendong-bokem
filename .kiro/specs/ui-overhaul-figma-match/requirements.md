# Requirements Document

## Introduction

This specification covers the complete UI overhaul of the AromaSys warehouse management web application to achieve pixel-perfect alignment with the approved Figma designs. The overhaul targets all public pages (Landing, Login, Register) and all dashboard pages (Main Dashboard, FIFO & Expiry, Cold-Chain Monitor, Data Ingestion, Auto-Report, Inventory Master, Audit Trail), plus a redesigned Chatbot experience as a floating overlay card. The Interactive Floor Plan page is explicitly excluded from this overhaul.

The goal is to produce an enterprise-grade, professional UI that strictly follows the design system defined in `desain.md`, using the existing tech stack (Next.js 16, React 19, lucide-react, custom CSS with CSS variables, PostgreSQL).

## Glossary

- **Landing_Page**: The public-facing homepage at route `/` that displays branding, hero content, and navigation to Sign In / Sign Up
- **Login_Page**: The authentication page at route `/login` with split-screen layout (image left, form right)
- **Register_Page**: The registration page at route `/register` with split-screen layout (image left, form right)
- **Dashboard_Layout**: The persistent shell wrapping all authenticated pages, consisting of Sidebar, Topbar, Content Area, and Floating Chatbot Button
- **Sidebar**: The persistent left navigation panel (240px width) with dark background, logo, grouped menu items, and logout
- **Topbar**: The sticky top header bar (56px height) with search, notifications dropdown, settings icon, and profile dropdown
- **Main_Dashboard**: The primary dashboard page at route `/dashboard` displaying stat cards, alert banners, expiry table, and quick actions
- **FIFO_Expiry_Page**: The page at route `/digital-twin/fifo-expiry` showing a color-coded table of items sorted by expiration date
- **Cold_Chain_Page**: The page at route `/digital-twin/cold-chain` showing real-time temperature charts and zone status indicators
- **Data_Ingestion_Page**: The page at route `/copilot/upload` for uploading documents via drag-and-drop with OCR preview
- **Auto_Report_Page**: The page at route `/copilot/report` for generating and downloading reports with parameter selection
- **Inventory_Master_Page**: The page at route `/settings/inventory` showing the full inventory data table with search, filter, and pagination
- **Audit_Trail_Page**: The page at route `/settings/audit` showing immutable audit log entries with filtering
- **Chatbot_Overlay**: A large card overlay (modal-style) that appears when the floating chatbot button is clicked, providing AI chat functionality without navigating away from the current page
- **Floating_Chatbot_Button**: A circular floating action button (74px) positioned at bottom-right of all dashboard pages, using a robot icon with the green theme color
- **Design_System**: The comprehensive design specification defined in `desain.md` covering colors, typography, spacing, components, and layout rules
- **CSS_Variables**: The design tokens defined in `globals.css` as CSS custom properties used throughout the application

## Requirements

### Requirement 1: Landing Page Redesign

**User Story:** As a visitor, I want to see a professional, enterprise-grade landing page, so that I have confidence in the AromaSys platform before signing in.

#### Acceptance Criteria

1. THE Landing_Page SHALL render a top navigation bar with the AromaSys logo (leaf icon + "AromaSys" text) on the left and a "Sign In" outlined pill button linking to `/login` and a "Sign Up" filled pill button linking to `/register` on the right
2. THE Landing_Page SHALL display a hero section with a gradient heading ("Interactive Dashboard") using Poppins font at a minimum size of 48px, with `background: linear-gradient(135deg, #BCF389 0%, #366306 100%)` and `-webkit-background-clip: text`
3. THE Landing_Page SHALL use `#D7E5D8` as the full-page background color matching the Figma design token `--color-figma-bg`
4. THE Landing_Page SHALL display a subtitle paragraph below the hero heading using Inter font in color `#848484`
5. IF the user is already authenticated, THEN THE Landing_Page SHALL redirect to `/dashboard` without displaying the landing content
6. WHILE the authentication status is being determined, THE Landing_Page SHALL display a loading indicator instead of the landing content
7. THE Landing_Page SHALL apply a fade-in animation with a duration of 600ms on the hero content using the `fadeIn` keyframe defined in the design system, and SHALL disable the animation when the user has enabled `prefers-reduced-motion`

### Requirement 2: Login Page Redesign

**User Story:** As a user, I want a clean, professional login page that matches the Figma design, so that I can authenticate securely with a polished experience.

#### Acceptance Criteria

1. THE Login_Page SHALL use a split-screen layout with the form panel on the left (50% width) and an atmospheric background image on the right (50% width) with a curved left edge having a border radius of 120px
2. WHEN the viewport width is 1024px or less, THE Login_Page SHALL hide the background image panel and display only the form panel at full width
3. THE Login_Page SHALL display a "Back" link with a left arrow icon at the top of the form panel, navigating to the Landing_Page
4. THE Login_Page SHALL display "Sign In" as the page title in Poppins font weight 600 and "Sign In to your AromaSys account" as the subtitle
5. THE Login_Page SHALL render material-style outlined input fields for Email (type email), Password (with a show/hide visibility toggle button), and Role (a dropdown select with options: Operator, QC, PPIC, Admin)
6. THE Login_Page SHALL display a "Remember me" checkbox on the left and a "Forgot Password" link in red (`#EA4B48`) on the right in the same row
7. THE Login_Page SHALL render a full-width primary submit button with text "Sign In" using the brand primary color (`#366306`) as background and a height of 45px with 8px border radius
8. THE Login_Page SHALL display a footer text "Don't have an account? Sign Up" with the "Sign Up" link navigating to `/register`
9. IF the user submits the form with any required field (Email, Password, or Role) left empty, THEN THE Login_Page SHALL display an inline error message above the form fields indicating which fields are required
10. IF the user submits credentials that do not match any existing account in the database, THEN THE Login_Page SHALL display an inline error message above the form fields indicating that the credentials are invalid
11. IF the user is already authenticated when the Login_Page loads, THEN THE Login_Page SHALL redirect to `/dashboard` without displaying the login form

### Requirement 3: Register Page Redesign

**User Story:** As a new user, I want a registration page that matches the Figma design, so that I can create an account with a consistent visual experience.

#### Acceptance Criteria

1. THE Register_Page SHALL use the same split-screen layout as the Login_Page with form on the left and atmospheric image on the right
2. THE Register_Page SHALL include input fields for Full Name, Email, Password (with show/hide toggle), Confirm Password (with show/hide toggle), and Role (dropdown select)
3. THE Register_Page SHALL render a full-width primary submit button with text "Sign Up"
4. THE Register_Page SHALL display a footer text "Already have an account? Sign In" with the "Sign In" link navigating to `/login`
5. IF the password and confirm password fields do not match, THEN THE Register_Page SHALL display an inline error message below the confirm password field
6. IF the registration API returns an error, THEN THE Register_Page SHALL display the error message inline above the form

### Requirement 4: Dashboard Layout Shell

**User Story:** As an authenticated user, I want a consistent, professional layout shell across all dashboard pages, so that navigation and context are always clear.

#### Acceptance Criteria

1. THE Dashboard_Layout SHALL render the Sidebar at a fixed width of 240px on the left with `position: sticky` and full viewport height
2. THE Dashboard_Layout SHALL render the Topbar at 56px height, sticky at the top, with a search input (rounded pill, `#F5F6FA` background), notification bell icon, settings icon, a vertical divider, and the user profile section (avatar + name + role + chevron)
3. WHEN the notification bell is clicked, THE Dashboard_Layout SHALL display a dropdown card (254px width, `#EEF3E7` background, 12px border-radius) with notification items, and WHEN the user clicks anywhere outside the dropdown, THE Dashboard_Layout SHALL close the dropdown
4. WHEN the profile section is clicked, THE Dashboard_Layout SHALL display a dropdown menu (205px width, `#EEF3E7` background, 12px border-radius) with options: Manage Account, Change Password, Activity Log, and Log out, and WHEN the user clicks anywhere outside the dropdown, THE Dashboard_Layout SHALL close the dropdown
5. WHILE the current route is not the Copilot Chat page, THE Dashboard_Layout SHALL render the Floating_Chatbot_Button as a fixed 74px circular button in the bottom-right corner of the viewport
6. THE Dashboard_Layout SHALL apply `background: var(--color-figma-bg)` to the content area
7. IF the user is not authenticated, THEN THE Dashboard_Layout SHALL redirect the user to the Login page within 1 second without rendering dashboard content
8. WHEN the user clicks the Log out option in the profile dropdown, THE Dashboard_Layout SHALL end the user session and redirect the user to the Login page
9. WHILE the user session is being verified on initial page load, THE Dashboard_Layout SHALL display a loading indicator and SHALL NOT render the sidebar, topbar, or content area

### Requirement 5: Sidebar Navigation

**User Story:** As an authenticated user, I want a dark-themed sidebar with clear navigation groups, so that I can quickly access any module.

#### Acceptance Criteria

1. THE Sidebar SHALL use a dark green background (`#2C742F` or `--color-brand-dark`) with white/light text for all navigation items
2. THE Sidebar SHALL display the AromaSys logo area at the top with the "AS" monogram icon and "AromaSys" brand text with "SIMA AROME" subtitle
3. THE Sidebar SHALL organize navigation items into groups: MAIN (Dashboard), WAREHOUSE (Interactive Floor Plan, FIFO & Expiry, Cold-Chain Monitor), PRODUCTION (Data Ingestion, Auto-Report), SETTINGS (Inventory Master, Audit Trail)
4. WHILE a navigation item's route matches the current page path, THE Sidebar SHALL highlight that item with a visually differentiated background (e.g., `rgba(255,255,255,0.15)`) and an accent text color (e.g., `#BCF389`) to distinguish it from inactive items
5. THE Sidebar SHALL display a Logout button at the bottom with a LogOut icon
6. WHILE the user role is Operator or QC, THE Sidebar SHALL hide the Audit Trail menu item from the SETTINGS group
7. WHEN the user clicks the Logout button, THE Sidebar SHALL clear the user session and redirect the user to the login page within 2 seconds
8. THE Sidebar SHALL remain persistently visible on all pages after the user has authenticated, maintaining its state across page navigations

### Requirement 6: Main Dashboard Page

**User Story:** As an authenticated user, I want a dashboard overview with key metrics and alerts, so that I can quickly assess warehouse status.

#### Acceptance Criteria

1. THE Main_Dashboard SHALL display a page header with title "Dashboard Overview"
2. THE Main_Dashboard SHALL render four stat cards in a grid layout showing: Total Active Items (count of non-expired inventory items), Expiring Soon (count of items expiring within 30 days), Warehouse Capacity (percentage of occupied slots out of total slots), and Cold-Chain Zones (count of zones with temperature anomalies)
3. WHEN there are items with expiry date within 7 days or expired status, or zones with temperature readings outside the range of -5°C to 5°C, THE Main_Dashboard SHALL display alert banners with a 4px left border (red using the critical status color for expired or temperature anomalies, yellow using the warning status color for items expiring within 30 days) below the stat cards
4. THE Main_Dashboard SHALL display a table titled "Items Requiring Immediate Use" showing inventory items that are expired or expiring within 7 days, sorted by expiry date ascending, with columns: Name, Lot Number (displayed in monospace font), Expiry Date, and Status badge (color-coded per the design system semantic status colors), limited to a maximum of 10 rows with a "View All" link to the FIFO & Expiry Tracker page
5. THE Main_Dashboard SHALL render quick action buttons: "Ask Copilot" (navigating to the Copilot Chat page) and "View Floor Plan" (navigating to the Interactive Floor Plan page)
6. THE Main_Dashboard SHALL use the design system's card component styling with 12px border-radius, white background, and box-shadow of 0 1px 3px rgba(0,0,0,0.06)
7. WHILE the Main_Dashboard is fetching data from the database, THE Main_Dashboard SHALL display a loading indicator in place of the dashboard content
8. IF the data fetch fails, THEN THE Main_Dashboard SHALL display an error state with a retry option allowing the user to re-attempt the data load

### Requirement 7: FIFO & Expiry Page

**User Story:** As a warehouse operator, I want to see all items sorted by expiration date with color-coded urgency, so that I can prioritize usage.

#### Acceptance Criteria

1. THE FIFO_Expiry_Page SHALL display a data table with columns: material name, item ID, intake date, location slot, status badge, and expiry timeline, sorted ascending by expiration date (nearest expiry first)
2. THE FIFO_Expiry_Page SHALL color-code table rows: red background (`#FDEDEC`) for items that are expired or have fewer than 7 calendar days until expiry, yellow background (`#FEF9E7`) for items with 7 to 29 calendar days until expiry, and transparent background for items with 30 or more calendar days until expiry
3. THE FIFO_Expiry_Page SHALL display a status badge in each row: "CRITICAL" (red) for items expired or fewer than 7 days until expiry, "WARNING" (yellow) for items with 7 to 29 days until expiry, or "SAFE" (green) for items with 30 or more days until expiry, using the design system badge component
4. WHEN the user selects a zone filter or material category filter, THE FIFO_Expiry_Page SHALL display only items matching the selected filter values while maintaining ascending expiry date sort order
5. WHEN the user clicks the "Export Excel" button, THE FIFO_Expiry_Page SHALL generate and download a file containing all currently displayed (filtered) items with columns: ID, material name, category, quantity and unit, location, intake date, expiry date, days remaining, and status
6. IF the inventory data fails to load, THEN THE FIFO_Expiry_Page SHALL display an error message indicating the data could not be retrieved
7. IF no items match the applied filters, THEN THE FIFO_Expiry_Page SHALL display an empty-state message indicating no matching items were found

### Requirement 8: Cold-Chain Monitor Page

**User Story:** As a warehouse operator, I want to monitor real-time temperature data per zone with visual alerts, so that I can respond to anomalies immediately.

#### Acceptance Criteria

1. THE Cold_Chain_Page SHALL display temperature charts with time on the X-axis and temperature (°C) on the Y-axis for each monitored zone, showing up to 24 hourly data points per zone
2. THE Cold_Chain_Page SHALL render dashed lines indicating both the upper threshold (tempMax) and lower threshold (tempMin) on each zone's chart
3. THE Cold_Chain_Page SHALL display zone status indicators using color-coded badges where: green (safe) indicates all readings are within thresholds and the maximum reading is at least 2°C below tempMax, yellow (warning) indicates the maximum reading is within 2°C of tempMax but no reading exceeds thresholds, and red (danger) indicates at least one reading exceeds tempMax or falls below tempMin
4. WHEN a zone temperature reading exceeds tempMax or falls below tempMin, THE Cold_Chain_Page SHALL display a red alert indicator for that zone listing the timestamps and values of anomalous readings
5. THE Cold_Chain_Page SHALL use the design system card component to wrap each zone's monitoring panel
6. IF the temperature data API request fails, THEN THE Cold_Chain_Page SHALL display an error state indicating that sensor data could not be loaded while preserving the zone layout structure
7. WHILE temperature data is being fetched from the API, THE Cold_Chain_Page SHALL display a loading indicator in place of the chart content

### Requirement 9: Data Ingestion (Upload) Page

**User Story:** As a user, I want to upload documents via drag-and-drop and preview extracted data, so that I can efficiently digitize paper records.

#### Acceptance Criteria

1. THE Data_Ingestion_Page SHALL display a drag-and-drop upload area with a dashed border, upload icon, and instructional text indicating accepted file types (PDF, JPG, JPEG, PNG, XLSX, CSV) with a maximum file size of 10 MB per file
2. WHEN a file is dropped or selected, THE Data_Ingestion_Page SHALL display a processing indicator while extraction is in progress, followed by a preview panel showing the extracted data in a table with columns: material name, parsed quantity (value and unit), and extracted lot number
3. THE Data_Ingestion_Page SHALL provide a "Save to Database" primary button and an "Edit Results" secondary button below the preview, where "Edit Results" enables inline editing of individual rows in the extracted data table
4. THE Data_Ingestion_Page SHALL use the design system's card styling for the upload area and preview panels
5. IF the upload or parsing fails, THEN THE Data_Ingestion_Page SHALL display an error state with an AlertCircle icon, an error message indicating the failure reason, and a retry button that allows the user to re-upload without losing the selected file reference
6. WHEN extracted data is displayed, THE Data_Ingestion_Page SHALL check for potential duplicates against existing database records and display a warning banner listing items that match or closely resemble existing entries
7. IF the user clicks "Save to Database" while any row is in edit mode, THEN THE Data_Ingestion_Page SHALL keep the save button disabled until all row edits are confirmed or cancelled

### Requirement 10: Auto-Report Page

**User Story:** As a user, I want to generate reports by selecting parameters and previewing results, so that I can produce formatted documents efficiently.

#### Acceptance Criteria

1. THE Auto_Report_Page SHALL display a form with parameter inputs: date range (start date and end date using date picker inputs), and report type selection offering the following options: Daily Inventory Status, FIFO & Expiry Tracker, Cold-Chain Temperature, and Warehouse Audit Activity
2. THE Auto_Report_Page SHALL provide format output options: PDF and Excel
3. THE Auto_Report_Page SHALL include a "Generate" primary button and a "Download" secondary button, where the "Download" button is disabled until a report has been successfully generated
4. WHEN the generate button is clicked, THE Auto_Report_Page SHALL display a loading indicator for the duration of data retrieval, then render a preview area showing the generated report content including a KPI summary section and a sample data table
5. IF the end date is earlier than the start date, THEN THE Auto_Report_Page SHALL prevent generation and display an inline validation error message indicating the date range is invalid
6. IF report generation completes but no data exists for the selected parameters, THEN THE Auto_Report_Page SHALL display an empty state in the preview area with a message indicating no records were found for the selected period
7. THE Auto_Report_Page SHALL use the design system's card and input component styling throughout

### Requirement 11: Inventory Master Page

**User Story:** As a user, I want to view, search, and filter the complete inventory database, so that I can find and manage material records.

#### Acceptance Criteria

1. THE Inventory_Master_Page SHALL display a data table with columns: ID (monospace font), Name, Category, Quantity, Location, Date Added, Expiry Date, and Status, where Status is displayed as a badge colored according to the design system's semantic status colors (safe, warning, critical, expired)
2. THE Inventory_Master_Page SHALL provide a search input that filters table rows by matching against the Name and ID columns, and dropdown filter controls for category, zone, and status displayed above the table
3. THE Inventory_Master_Page SHALL implement pagination controls below the table displaying 10 items per page, with previous/next navigation buttons and page number indicators showing the current range of displayed entries out of total entries
4. WHILE the user role is QC or Admin, THE Inventory_Master_Page SHALL display Edit and Delete action buttons in each row
5. WHILE the user role is Operator or PPIC, THE Inventory_Master_Page SHALL hide Edit and Delete action buttons
6. THE Inventory_Master_Page SHALL use the design system's table styling with row hover background change, uppercase column headers using the heading-sm type scale, and status-colored row backgrounds for expired and warning items
7. IF the data fetch from the inventory API fails, THEN THE Inventory_Master_Page SHALL display an error notification indicating the failure and allow the user to retry loading the data
8. IF the applied search or filter criteria return zero matching records, THEN THE Inventory_Master_Page SHALL display an empty state with an icon, a heading stating no records were found, and a suggestion to reset filters
9. WHILE inventory data is being fetched, THE Inventory_Master_Page SHALL display a loading indicator within the table area until the data is fully loaded or an error occurs

### Requirement 12: Audit Trail Page

**User Story:** As a PPIC or Admin user, I want to view immutable audit logs with filtering, so that I can track all system changes.

#### Acceptance Criteria

1. THE Audit_Trail_Page SHALL display a log table with columns: Timestamp, User Name, Role, Action, Change Details, and Module, sorted by newest entries first
2. THE Audit_Trail_Page SHALL provide filter controls for date range (start date and end date) and user name, and SHALL display a count of matching log entries
3. WHEN the user clicks the "Export Log" button, THE Audit_Trail_Page SHALL generate a CSV file containing all currently displayed log entries and initiate a browser download
4. THE Audit_Trail_Page SHALL NOT provide any edit or delete functionality for log entries
5. THE Audit_Trail_Page SHALL apply monospace formatting to the Timestamp and ID values in the log table
6. IF a user with a role other than PPIC or Admin attempts to access the Audit_Trail_Page, THEN THE System SHALL redirect the user to the Dashboard page
7. IF no log entries match the current filter criteria, THEN THE Audit_Trail_Page SHALL display an empty state message indicating that no activity matches the filters

### Requirement 13: Chatbot Overlay Redesign

**User Story:** As an authenticated user, I want to access the AI chatbot as a large overlay card from any dashboard page, so that I can ask questions without losing my current context.

#### Acceptance Criteria

1. THE Floating_Chatbot_Button SHALL be a 74px circular button positioned fixed at bottom-right (32px from edges) on all dashboard pages
2. THE Floating_Chatbot_Button SHALL use the application's green theme color (`#366306`) as background instead of orange
3. THE Floating_Chatbot_Button SHALL display a robot icon (from lucide-react `Bot` icon) instead of the MessageSquare icon
4. WHEN the Floating_Chatbot_Button is clicked, THE Chatbot_Overlay SHALL appear as a centered card covering between 75% and 85% of the viewport width and height, with a backdrop of background color black at 50% opacity
5. THE Chatbot_Overlay SHALL display a chat interface with: a header containing the title "Production Copilot" and a close button, scrollable message bubbles (user-sent aligned right, AI-sent aligned left), and a fixed input field with a send button at the bottom
6. THE Chatbot_Overlay SHALL use the green theme color (`#366306`) for the AI avatar and accent elements instead of orange
7. WHEN the close button, backdrop area, or Escape key is pressed, THE Chatbot_Overlay SHALL dismiss and return focus to the underlying page
8. THE Chatbot_Overlay SHALL NOT navigate the user to a separate `/copilot/chat` page
9. WHEN the Chatbot_Overlay is dismissed and reopened during the same page session, THE Chatbot_Overlay SHALL preserve the conversation history including all previously sent and received messages
10. IF the AI API request fails while the Chatbot_Overlay is open, THEN THE Chatbot_Overlay SHALL display an error message indicating the request failed and keep the input field enabled for retry

### Requirement 14: Design System Compliance

**User Story:** As a product owner, I want all pages to strictly follow the design system tokens and component specifications, so that the UI is consistent and enterprise-grade.

#### Acceptance Criteria

1. THE Dashboard_Layout SHALL use CSS variables from `globals.css` for all colors, spacing, typography, and shadows — no hardcoded hex values in component styles except for `#FFFFFF` used within CSS variable definitions in `globals.css` itself
2. THE Dashboard_Layout SHALL use Poppins font for headings and display text (via `--text-display`, `--text-heading-lg`, `--text-heading-md`, `--text-heading-sm` tokens), Poppins font for body and UI text (via `--text-body-lg`, `--text-body-md`, `--text-body-sm` tokens), and IBM Plex Mono for lot numbers, slot codes, and inventory IDs (via the `.mono` class)
3. THE Dashboard_Layout SHALL apply `--radius-lg` (12px) border-radius to all card components, `--radius-md` (8px) to buttons and inputs, and `--radius-full` (9999px) to chips and avatar elements
4. THE Dashboard_Layout SHALL implement hover states using the `--transition-fast` token (120ms ease) for color changes and the `--transition-normal` token (180ms cubic-bezier) for transform and shadow changes on all interactive elements (buttons, cards, table rows, navigation items)
5. THE Dashboard_Layout SHALL respect `prefers-reduced-motion: reduce` media query by setting `animation-duration` and `transition-duration` to 0.01ms on all elements, preventing visible motion for users who prefer reduced motion
6. THE Dashboard_Layout SHALL ensure all icons use lucide-react at sizes 16px (for button icons and table action icons), 20px (for navigation sidebar icons and status/alert icons), or 24px (for page title icons) with `aria-label` attributes on all icon-only buttons and standalone icons that convey meaning
7. WHEN a component style requires a value not covered by existing CSS variables in `globals.css`, THE Dashboard_Layout SHALL document the exception as a CSS comment referencing the design token gap, and the hardcoded value SHALL use the nearest semantic color from the design system's palette
