# Requirements Document

## Introduction

Enterprise polish specification for the AromaSys (SIMA AROME) warehouse management system. This specification covers branding updates (new logo), UI consistency fixes (toast positioning, navigation behavior), new role management, notification persistence, dashboard enhancements, floor plan upload and zone interaction improvements, cold chain filtering, data ingestion enhancements, auto-report improvements, audit trail profile photos, admin profile sync, AI pipeline upgrades with multi-model support, new AI QC features, and enterprise readiness patterns (security, reliability, scalability). The system uses Next.js 16 + React 19 + Tailwind CSS + Framer Motion frontend with an Express 5 + PostgreSQL backend, powered by Google Gemini with fallback chain for AI capabilities.

## Glossary

- **Application**: The AromaSys (SIMA AROME) warehouse management web application consisting of a Next.js frontend and Express backend
- **Sidebar**: The left navigation panel displayed on all authenticated dashboard pages containing grouped menu items
- **Login_Page**: The authentication page at `/login` where users sign in
- **Register_Page**: The authentication page at `/register` where users create accounts
- **Landing_Page**: The public landing page at route `/`
- **Toast_System**: The notification pop-up system used for confirmations, errors, and informational messages
- **User_Management**: The admin module for creating, editing, and managing user accounts and roles
- **Notification_System**: The in-app notification center that tracks alerts and read/unread state
- **Dashboard**: The main overview page at `/overview` displaying summary cards, charts, and zone information
- **Zone_Capacity_Indicator**: A color-coded visual element showing zone utilization percentage
- **Floor_Plan_Upload_Card**: The modal/card component for uploading floor plan images and PDFs
- **Floor_Plan_Page**: The interactive floor plan page at `/floor-plan` displaying warehouse zones
- **Cold_Chain_Page**: The cold chain monitoring page at `/cold-chain` displaying temperature data per zone
- **Data_Ingestion_Page**: The page at `/data-ingestion` handling OCR scanning and inventory data extraction
- **Ingestion_History**: The table showing past upload records within the Data_Ingestion_Page
- **Auto_Report_Page**: The page at `/auto-report` for generating and exporting warehouse reports
- **Audit_Trail_Page**: The page at `/audit-trail` displaying system activity logs with user attribution
- **Admin_Profile_Sync**: The mechanism ensuring admin edits to employee profiles propagate to the employee account
- **AI_Pipeline**: The multi-model AI processing system using Gemini as primary with support for external models
- **AI_QC_Module**: The quality control module using AI for fruit, raw-material, extract, and powder inspection
- **AI_Camera**: The photo-based quality inspection feature that captures images and performs pass/fail analysis
- **Backend_API**: The Express 5 server providing REST endpoints for all application operations
- **PPIC_Role**: The Production Planner (PPIC) role for production planning and inventory control users

## Requirements

### Requirement 1: Logo Replacement

**User Story:** As a brand manager, I want the application to display the updated AromaSys logo across all pages, so that the branding is consistent with the latest company identity.

#### Acceptance Criteria

1. THE Application SHALL render the image file `logo-aromasys-new.png` as the logo in the Sidebar component on all authenticated pages.
2. THE Login_Page SHALL display the image file `logo-aromasys-new.png` as the application logo.
3. THE Register_Page SHALL display the image file `logo-aromasys-new.png` as the application logo.
4. THE Application SHALL reference the logo from the path `/logo-aromasys-new.png` in the public directory.

### Requirement 2: Toast Notification Positioning

**User Story:** As a user, I want all confirmation and notification pop-ups to appear in a consistent location, so that I always know where to look for feedback messages.

#### Acceptance Criteria

1. THE Toast_System SHALL render all toast notifications at the bottom-right corner of the viewport.
2. THE Toast_System SHALL stack multiple simultaneous toasts vertically from the bottom-right corner with consistent spacing.
3. THE Toast_System SHALL maintain the bottom-right position across all pages and viewport sizes from 320px to 1920px width.

### Requirement 3: Auth Back Button Navigation

**User Story:** As a user, I want the back button on authentication pages to take me to the landing page, so that I have a predictable navigation path.

#### Acceptance Criteria

1. WHEN a user clicks the back button on the Login_Page, THE Application SHALL navigate to the Landing_Page at route `/`.
2. WHEN a user clicks the back button on the Register_Page, THE Application SHALL navigate to the Landing_Page at route `/`.
3. THE Application SHALL use direct route navigation to `/` instead of browser history-based navigation for the auth back button.

### Requirement 4: Production Planner Role

**User Story:** As an admin, I want to assign a Production Planner (PPIC) role to users, so that production planning staff have appropriate access permissions.

#### Acceptance Criteria

1. THE User_Management module SHALL include "Production Planner (PPIC)" as a selectable role when creating or editing a user account.
2. THE Backend_API SHALL accept and store the PPIC_Role value in the user roles data.
3. THE Application SHALL display "Production Planner (PPIC)" in role selection dropdowns and user profile displays.
4. WHEN a user is assigned the PPIC_Role, THE Application SHALL grant access to production planning and inventory control features.

### Requirement 5: Notification Persistence

**User Story:** As a user, I want my notification read state to persist across sessions, so that I do not see previously dismissed notifications after logging back in.

#### Acceptance Criteria

1. WHEN a user marks all notifications as read, THE Notification_System SHALL persist the read state to the Backend_API associated with the user account.
2. WHEN a user logs out and logs back in, THE Notification_System SHALL restore the previously saved read state from the Backend_API.
3. THE Notification_System SHALL store read state per user account on the server, not in browser local storage alone.
4. WHEN a user marks individual notifications as read, THE Notification_System SHALL persist each read state change to the Backend_API.

### Requirement 6: Dashboard Quick Stats and Zone Capacity

**User Story:** As a warehouse operator, I want a simplified quick stats display with color-coded zone capacity indicators, so that I can assess warehouse status at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL display quick stats cards with a simplified visual appearance using minimal borders and clean typography.
2. THE Dashboard SHALL display a Zone_Capacity_Indicator for each zone using color coding: green for utilization below 50%, yellow for utilization between 50% and 80%, and red for utilization above 80%.
3. WHEN zone capacity data loads from the Backend_API, THE Dashboard SHALL calculate the utilization percentage as (occupied slots / total slots) × 100 for each zone.
4. THE Dashboard SHALL update Zone_Capacity_Indicator colors dynamically when capacity data changes.

### Requirement 7: Floor Plan Upload Card Fix

**User Story:** As a warehouse manager, I want the floor plan upload card to display correctly without visual clipping and with side-by-side drop zones, so that I can easily upload both image and PDF files.

#### Acceptance Criteria

1. THE Floor_Plan_Upload_Card SHALL render without backdrop clipping or overflow hidden issues on the modal container.
2. THE Floor_Plan_Upload_Card SHALL display the image drop zone and PDF drop zone side-by-side in a horizontal layout.
3. THE Floor_Plan_Upload_Card SHALL have sufficient width to accommodate both drop zones without content wrapping on viewports 768px and wider.
4. THE Floor_Plan_Upload_Card SHALL apply a visible backdrop overlay that covers the full viewport behind the card.

### Requirement 8: Floor Plan Zone Draggable and Resizable

**User Story:** As a warehouse manager, I want to drag and resize zones after creation and access zone details via a dedicated icon, so that I can adjust the layout without accidentally triggering detail popups.

#### Acceptance Criteria

1. WHEN a user drags a zone on the Floor_Plan_Page canvas, THE Floor_Plan_Page SHALL update the zone position in real-time following pointer movement.
2. WHEN a user resizes a zone using edge or corner handles, THE Floor_Plan_Page SHALL update the zone dimensions while enforcing a minimum size of 5% width and 5% height.
3. THE Floor_Plan_Page SHALL display an arrow icon on each zone for accessing zone detail information.
4. WHEN a user clicks the arrow icon on a zone, THE Floor_Plan_Page SHALL open the zone details panel or modal.
5. WHEN a user clicks directly on the zone body (not the arrow icon), THE Floor_Plan_Page SHALL NOT open the zone details panel, allowing uninterrupted drag operations.
6. THE Floor_Plan_Page SHALL persist updated zone positions and dimensions to localStorage after each drag or resize operation.

### Requirement 9: Cold Chain Zone Filter

**User Story:** As a cold chain operator, I want to filter monitoring data by zone, so that I can focus on specific storage areas.

#### Acceptance Criteria

1. THE Cold_Chain_Page SHALL display zone filter buttons including "All Zones" and one button per configured zone (Zone A, Zone B, etc.).
2. WHEN a user clicks a zone filter button, THE Cold_Chain_Page SHALL display only the temperature and humidity data for the selected zone.
3. WHEN a user clicks "All Zones", THE Cold_Chain_Page SHALL display data for all zones simultaneously.
4. THE Cold_Chain_Page SHALL visually indicate the currently active zone filter button with a distinct selected state.

### Requirement 10: Ingestion History Enhancements

**User Story:** As a warehouse operator, I want to delete ingestion history records and see a proper loading indicator, so that I can manage upload records and have clear feedback during processing.

#### Acceptance Criteria

1. THE Ingestion_History SHALL display a delete action button for each history record row.
2. WHEN a user clicks the delete button on a history record, THE Data_Ingestion_Page SHALL remove the record from the history list and persist the change.
3. WHILE the Data_Ingestion_Page is processing a file upload, THE Data_Ingestion_Page SHALL display a circular spinner animation instead of a generic waiting animation.
4. THE circular spinner SHALL be visible in the upload area during the entire duration of file processing.

### Requirement 11: Data Ingestion Action Column Position

**User Story:** As a warehouse operator, I want the action column in the data ingestion table to be the first column, so that I can quickly access row actions without scrolling.

#### Acceptance Criteria

1. THE Data_Ingestion_Page SHALL render the action column (containing edit, delete, and other row action buttons) as the leftmost column in the extraction results table.
2. THE Data_Ingestion_Page SHALL maintain the action column in the leftmost position regardless of horizontal scroll state.

### Requirement 12: Auto-Report Enhancements

**User Story:** As a warehouse manager, I want more informative report content with custom notes and appropriate export formats, so that I can generate professional reports and data exports.

#### Acceptance Criteria

1. THE Auto_Report_Page SHALL generate report content with detailed summaries including inventory status, zone utilization, expiry alerts, and trend analysis.
2. THE Auto_Report_Page SHALL provide a custom notes input field allowing users to add free-text annotations to the report.
3. WHEN a user exports as PDF, THE Auto_Report_Page SHALL generate a formatted report document including headers, sections, charts, and custom notes.
4. WHEN a user exports as Excel, THE Auto_Report_Page SHALL generate a tabular data export containing raw inventory and metrics data without report formatting.
5. THE Auto_Report_Page SHALL include the custom notes content in the PDF export but not in the Excel export.

### Requirement 13: Audit Trail Profile Photos

**User Story:** As an admin, I want the audit trail to show actual user profile photos, so that I can quickly identify who performed each action.

#### Acceptance Criteria

1. THE Audit_Trail_Page SHALL display the profile photo of the user who performed each logged action next to the audit entry.
2. WHEN a user has uploaded a profile photo, THE Audit_Trail_Page SHALL render that photo as a circular avatar beside the audit log entry.
3. IF a user does not have a profile photo, THEN THE Audit_Trail_Page SHALL display a default avatar with the user initials.

### Requirement 14: Admin Profile Sync

**User Story:** As an admin, I want profile changes I make to employee accounts to reflect immediately in the employee's own profile view, so that employee data stays consistent.

#### Acceptance Criteria

1. WHEN an admin edits an employee profile (name, email, role, or photo) through User_Management, THE Backend_API SHALL update the employee's account record in the database.
2. WHEN an employee logs in after an admin edit, THE Application SHALL display the updated profile information reflecting the admin's changes.
3. THE Backend_API SHALL log admin profile edits to the audit trail with the admin user as the actor and the employee as the target.

### Requirement 15: AI Pipeline Multi-Model Upgrade

**User Story:** As a system architect, I want the AI pipeline to use the best model per task and support external models, so that the system achieves optimal accuracy for each AI capability.

#### Acceptance Criteria

1. THE AI_Pipeline SHALL use Google Gemini as the primary model combined with task-specific model selection for optimal performance.
2. THE AI_Pipeline SHALL support external model integration for floor plan analysis tasks requiring specialized vision capabilities.
3. THE AI_Pipeline SHALL support external model integration for PDF, image, and Excel document processing tasks.
4. IF the primary AI model fails or returns low-confidence results, THEN THE AI_Pipeline SHALL fall back to the next model in the configured fallback chain.
5. THE AI_Pipeline SHALL provide a configuration interface for specifying which model handles each task type (floor-plan, OCR, chatbot, QC).

### Requirement 16: AI Quality Control Features

**User Story:** As a quality control operator, I want AI-powered inspection for fruits, raw materials, extracts, and powders with camera-based pass/fail assessment, so that I can automate quality checks and reduce manual inspection time.

#### Acceptance Criteria

1. THE AI_QC_Module SHALL provide a Fruit and Raw-Material quality control interface for inspecting incoming produce and raw ingredients.
2. THE AI_QC_Module SHALL provide an Extract and Powder quality control interface for inspecting processed materials.
3. THE AI_Camera SHALL capture photos of materials and perform AI-based pass/fail quality assessment.
4. WHEN the AI_Camera determines a pass or fail result, THE AI_QC_Module SHALL automatically record the inspection result to the database with timestamp, material ID, result, and confidence score.
5. THE AI_QC_Module SHALL display inspection results with pass/fail status, confidence percentage, and identified defects or quality notes.
6. WHEN an inspection is completed, THE AI_QC_Module SHALL create an audit trail entry recording the QC action and result.

### Requirement 17: Enterprise Readiness

**User Story:** As a system architect, I want the application to implement security, reliability, and scalability patterns, so that the system is production-ready for enterprise deployment.

#### Acceptance Criteria

1. THE Application SHALL implement input validation and sanitization on all Backend_API endpoints to prevent injection attacks.
2. THE Application SHALL implement rate limiting on authentication endpoints to prevent brute-force attacks.
3. THE Backend_API SHALL implement structured error responses with consistent error codes and messages across all endpoints.
4. THE Application SHALL implement request retry logic with exponential backoff for transient Backend_API failures.
5. THE Backend_API SHALL implement database connection pooling for efficient resource utilization under concurrent load.
6. THE Application SHALL implement JWT token refresh mechanism to maintain user sessions without requiring re-authentication.
7. THE Backend_API SHALL implement request logging with correlation IDs for distributed tracing and debugging.
8. THE Application SHALL implement graceful degradation when AI services are unavailable, allowing core warehouse operations to continue without AI features.
