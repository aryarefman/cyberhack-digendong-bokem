# Requirements Document

## Introduction

This specification covers a comprehensive polish and feature completion pass for the AromaSys WMS (Warehouse Management System). The scope includes removing unnecessary navigation elements from the Floor Plan page, implementing a floor plan image upload feature, fixing layout and spacing issues across all pages, correcting the sidebar logo to match the Figma design, creating missing pages (Profile), ensuring all features are production-ready, and achieving a professional UI/UX standard throughout the application.

## Glossary

- **Application**: The AromaSys WMS Next.js 15 web application with App Router
- **Floor_Plan_Page**: The page at route `/digital-twin/floor-plan` displaying the interactive warehouse layout
- **Digital_Twin_Tabs**: The sub-navigation element (`div.digital-twin-tabs`) containing links to Interactive Floor Plan, FIFO & Expiry, and Cold-Chain Monitor
- **Sidebar**: The persistent left navigation component rendered by `Sidebar.js`
- **Profile_Page**: The user account management page at route `/settings/profile`
- **Floor_Plan_Upload**: The feature allowing users to upload a warehouse floor plan image and PDF metadata
- **Hotspot**: An interactive overlay element positioned on top of a floor plan image representing a warehouse zone or slot
- **Content_Area**: The main content region (`.content-area`) within the dashboard layout
- **Page_Header**: The section containing the page title and subtitle (`.page-header`)
- **Design_Tokens**: CSS custom properties defined in `globals.css` controlling spacing, colors, and typography

## Requirements

### Requirement 1: Remove Digital Twin Navigation Tabs

**User Story:** As a warehouse operator, I want the Floor Plan page to display only the interactive floor plan without sub-navigation tabs, so that the interface is cleaner and I navigate via the sidebar instead.

#### Acceptance Criteria

1. WHEN the Floor_Plan_Page renders, THE Application SHALL display the floor plan content without the Digital_Twin_Tabs element.
2. THE Application SHALL remove the entire `digital-twin-tabs` div and its child links from the Floor_Plan_Page component.
3. WHEN a user navigates to `/digital-twin/floor-plan`, THE Application SHALL render the page without any tab-based sub-navigation for FIFO & Expiry or Cold-Chain Monitor.

### Requirement 2: Floor Plan Image Upload Feature

**User Story:** As a warehouse manager, I want to upload a floor plan image (denah) and associated PDF information, so that the system renders an interactive floor plan view with hotspots overlaid on my custom warehouse layout.

#### Acceptance Criteria

1. THE Application SHALL provide a floor plan upload interface accessible from the Floor_Plan_Page or a dedicated upload route.
2. WHEN a user selects an image file (PNG, JPG, or WEBP format), THE Floor_Plan_Upload SHALL accept the file and store it for rendering.
3. WHEN a user selects a PDF file containing floor plan metadata, THE Floor_Plan_Upload SHALL accept the file and extract relevant zone or slot information.
4. WHEN a floor plan image has been uploaded, THE Application SHALL render the image as the background of the interactive floor plan view.
5. WHEN a floor plan image is displayed, THE Application SHALL overlay interactive Hotspot elements on top of the image at positions corresponding to warehouse zones.
6. THE Application SHALL provide an API route at `/api/floor-plan-upload` to handle file upload requests with multipart form data.
7. IF a user uploads a file exceeding 10MB, THEN THE Application SHALL display an error message indicating the file size limit.
8. IF a user uploads a file with an unsupported format, THEN THE Application SHALL display an error message listing accepted formats.

### Requirement 3: Layout and Spacing Fixes

**User Story:** As a user, I want consistent and adequate spacing between page elements across all pages, so that the interface feels structured and content does not overflow its containers.

#### Acceptance Criteria

1. THE Application SHALL maintain a minimum spacing of 24px (var(--space-6)) between the Page_Header and the first content section on every dashboard page.
2. THE Application SHALL ensure that card elements (`.card`) do not overflow their parent container on any page including the report page.
3. THE Application SHALL apply consistent vertical spacing between sections using the Design_Tokens spacing scale across all dashboard pages.
4. WHEN the report page renders, THE Application SHALL constrain all card and panel elements within the bounds of the Content_Area without horizontal overflow.
5. THE Application SHALL apply a systematic spacing audit ensuring no element has less than 16px (var(--space-4)) margin between adjacent content blocks.
6. WHILE the viewport width is less than 1280px, THE Application SHALL reflow grid layouts to prevent content overflow while maintaining readable spacing.

### Requirement 4: Sidebar Logo Figma Match

**User Story:** As a product owner, I want the sidebar logo and branding to match the Figma design exactly, so that the application presents a consistent brand identity.

#### Acceptance Criteria

1. THE Sidebar SHALL render the logo section matching the design specified in Figma file key `T5U7kGTIeNrVnykNSRmKHv`.
2. THE Sidebar SHALL display the correct brand monogram, application name, and tagline as defined in the Figma sidebar node.
3. WHEN the Sidebar renders, THE Application SHALL use the exact typography, colors, and dimensions specified in the Figma design for the logo area.
4. THE Sidebar SHALL replace the current "AS" monogram, "AromaSys" text, and "SIMA AROME" subtitle with the correct elements from the Figma design.

### Requirement 5: Profile Page Creation

**User Story:** As a user, I want a complete profile management page, so that I can view and update my account information, change my password, and manage notification preferences.

#### Acceptance Criteria

1. THE Application SHALL provide a Profile_Page at route `/settings/profile` within the dashboard layout.
2. WHEN the Profile_Page renders, THE Application SHALL display the user avatar, full name, email address, and assigned role.
3. THE Profile_Page SHALL provide a form to update the user display name and email address.
4. THE Profile_Page SHALL provide a password change section requiring the current password and new password with confirmation.
5. THE Profile_Page SHALL provide a notification preferences section with toggleable settings for email and in-app notifications.
6. WHEN a user navigates to `/settings/profile?tab=password`, THE Profile_Page SHALL display the password change section as the active view.
7. THE Application SHALL provide an API route at `/api/profile` to handle profile read and update operations.
8. IF a user submits a password change with mismatched new password and confirmation, THEN THE Profile_Page SHALL display a validation error without submitting the request.
9. WHEN a profile update is saved successfully, THE Application SHALL display a success toast notification confirming the changes.

### Requirement 6: Production-Ready Functionality

**User Story:** As a company stakeholder, I want all application features to be fully functional and connected to live data, so that the system is ready for production use.

#### Acceptance Criteria

1. THE Application SHALL ensure all navigation links in the Sidebar resolve to existing, functional pages.
2. THE Application SHALL ensure all API routes return valid responses and handle error cases with appropriate HTTP status codes.
3. WHEN a user interacts with any CRUD operation (create, read, update, delete), THE Application SHALL persist changes to the Neon PostgreSQL database.
4. THE Application SHALL ensure the search input in the topbar performs a functional search or is clearly marked as a placeholder feature.
5. IF a database connection fails, THEN THE Application SHALL display a user-friendly error message and log the error for debugging.
6. THE Application SHALL ensure all form submissions include client-side validation before sending requests to the server.
7. WHEN the notification bell is clicked, THE Application SHALL display notifications sourced from actual system events or clearly indicate placeholder status.

### Requirement 7: Professional UI/UX Standards

**User Story:** As a user, I want the application to have a polished, professional appearance with consistent design patterns, so that the interface inspires confidence and is easy to use.

#### Acceptance Criteria

1. THE Application SHALL apply consistent border-radius values using Design_Tokens (var(--radius-sm) through var(--radius-xl)) across all interactive elements.
2. THE Application SHALL use the defined typography scale (var(--text-display) through var(--text-body-sm)) consistently for headings, body text, and labels on every page.
3. THE Application SHALL apply hover and focus states to all interactive elements (buttons, links, cards, inputs) using the defined transition tokens.
4. THE Application SHALL maintain a consistent color palette using only the defined Design_Tokens color variables across all pages.
5. THE Application SHALL ensure all pages use the same structural layout pattern: page header, content sections with cards, and consistent padding.
6. WHILE a data-fetching operation is in progress, THE Application SHALL display a loading indicator (spinner or skeleton) instead of empty content.
7. THE Application SHALL ensure all interactive elements have a minimum touch target size of 44x44 pixels for accessibility compliance.
8. THE Application SHALL ensure sufficient color contrast (minimum 4.5:1 ratio for normal text) between text and background colors across all pages.
