# Requirements Document

## Introduction

This feature adds a floor plan upload and conversion capability to the Interactive Floor Plan page (`/digital-twin/floor-plan`). Users can upload an image (JPG, PNG) or PDF of a physical warehouse floor plan, and the system uses AI (Gemini API) to analyze the document, extract zone layouts, slot positions, and zone types, then converts the extracted data into the interactive web-based floor plan format. Users can review and adjust the AI-generated layout before confirming and persisting it to the PostgreSQL database.

## Glossary

- **Upload_Converter**: The subsystem responsible for accepting file uploads, invoking AI analysis, and producing a structured floor plan layout from the uploaded document.
- **Floor_Plan_Layout**: A structured data representation of the warehouse floor plan containing zones, slots, and their spatial relationships, stored in the database.
- **Zone**: A named area within the warehouse floor plan, categorized by type (Cold Storage, Hazardous, General, Empty, Loading Dock).
- **Slot**: A labeled position within a zone, identified by a format such as A-1, B-2, following the pattern `{row_letter}-{column_number}`.
- **Gemini_API**: The Google Generative AI service (gemini-2.5-flash model) used for image and document analysis, already integrated in the project.
- **Layout_Preview**: An interactive preview component that displays the AI-generated floor plan layout for user review and adjustment before confirmation.
- **Zone_Type**: One of the predefined warehouse zone classifications: Cold Storage (blue), Bahan Berbahaya/Hazardous (red), Bahan Umum/General (green), Area Kosong/Empty (gray), Loading Dock (yellow).

## Requirements

### Requirement 1: File Upload

**User Story:** As a warehouse operator, I want to upload an image or PDF of my physical warehouse floor plan, so that the system can digitize it into the interactive web floor plan.

#### Acceptance Criteria

1. THE Upload_Converter SHALL accept file uploads in JPG, PNG, and PDF formats.
2. WHEN a file exceeding 10 MB in size is selected, THE Upload_Converter SHALL reject the file and display an error message indicating the maximum allowed file size.
3. WHEN a file with an unsupported format is selected, THE Upload_Converter SHALL reject the file and display an error message listing the supported formats (JPG, PNG, PDF).
4. THE Upload_Converter SHALL provide a drag-and-drop zone and a file picker button for file selection.
5. WHEN a valid file is selected, THE Upload_Converter SHALL display the file name, file size, and a thumbnail preview (for images) or file icon (for PDFs).

### Requirement 2: AI-Powered Floor Plan Analysis

**User Story:** As a warehouse operator, I want the system to automatically analyze my uploaded floor plan using AI, so that I do not have to manually draw the layout in the web application.

#### Acceptance Criteria

1. WHEN a valid file is uploaded, THE Upload_Converter SHALL send the file content to the Gemini_API for analysis.
2. WHILE the Gemini_API is processing the uploaded file, THE Upload_Converter SHALL display a loading indicator with a descriptive status message.
3. THE Gemini_API prompt SHALL instruct the model to extract: zone boundaries, zone types (Cold Storage, Hazardous, General, Empty, Loading Dock), slot positions, slot labels, and overall grid dimensions.
4. WHEN the Gemini_API returns a successful response, THE Upload_Converter SHALL parse the response into a structured Floor_Plan_Layout object containing zones and slots.
5. IF the Gemini_API returns an error or an unparseable response, THEN THE Upload_Converter SHALL display an error message and offer the user an option to retry the analysis.
6. IF the Gemini_API response contains no identifiable zones or slots, THEN THE Upload_Converter SHALL inform the user that no floor plan structure was detected and suggest uploading a clearer image.

### Requirement 3: Layout Preview and Adjustment

**User Story:** As a warehouse operator, I want to review and adjust the AI-generated floor plan layout before confirming it, so that I can correct any misinterpretations by the AI.

#### Acceptance Criteria

1. WHEN the AI analysis completes successfully, THE Layout_Preview SHALL render the extracted floor plan using the same visual grid system as the existing Interactive Floor Plan page.
2. THE Layout_Preview SHALL color-code zones according to the design system: Cold Storage (blue, `#D6EAF8`), Hazardous (red, `#FADBD8`), General (green, `#D5F5E3`), Empty (gray, `#F2F3F4`), Loading Dock (yellow, `#FEF9E7`).
3. THE Layout_Preview SHALL display slot labels in monospace font using the `{row_letter}-{column_number}` format.
4. WHEN a user clicks on a zone in the Layout_Preview, THE Upload_Converter SHALL allow the user to change the zone type via a dropdown selector.
5. WHEN a user clicks on a slot in the Layout_Preview, THE Upload_Converter SHALL allow the user to edit the slot label.
6. THE Layout_Preview SHALL provide a button to add a new zone to the layout.
7. THE Layout_Preview SHALL provide a button to remove a zone from the layout.
8. THE Layout_Preview SHALL display a summary showing the total number of zones and slots detected.

### Requirement 4: Layout Confirmation and Persistence

**User Story:** As a warehouse operator, I want to confirm and save the floor plan layout to the database, so that the interactive floor plan page uses my uploaded layout permanently.

#### Acceptance Criteria

1. WHEN the user clicks the confirm button, THE Upload_Converter SHALL save the Floor_Plan_Layout to the PostgreSQL database, creating or updating zone and slot records.
2. THE Upload_Converter SHALL create corresponding rows in the `slots` table for each slot in the confirmed layout, with the correct zone, row, and column values.
3. WHEN the layout is saved successfully, THE Upload_Converter SHALL display a success notification and redirect the user to the Interactive Floor Plan page showing the new layout.
4. IF a layout already exists in the database, THEN THE Upload_Converter SHALL warn the user that confirming will replace the existing layout and require explicit confirmation before proceeding.
5. WHILE the layout is being saved to the database, THE Upload_Converter SHALL display a saving indicator and disable the confirm button to prevent duplicate submissions.

### Requirement 5: Integration with Existing Floor Plan

**User Story:** As a warehouse operator, I want the uploaded floor plan to integrate with the existing slot system, so that I can continue using features like adding items to slots and viewing slot details.

#### Acceptance Criteria

1. THE Upload_Converter SHALL produce slot IDs in the same format used by the existing system (`{row_letter}-{column_number}`, e.g., A-1, B-2).
2. THE Upload_Converter SHALL assign each slot to a valid zone (A through E) consistent with the existing zone classification system.
3. WHEN the confirmed layout is loaded on the Interactive Floor Plan page, THE Floor_Plan_Layout SHALL support all existing interactions: clicking a slot to view details, adding items to empty slots, and editing or deleting items from occupied slots.
4. THE Upload_Converter SHALL preserve any existing inventory items in slots that match between the old and new layouts.

### Requirement 6: Access Control

**User Story:** As an administrator, I want only authorized users to upload and confirm floor plan layouts, so that the warehouse layout is not accidentally modified.

#### Acceptance Criteria

1. THE Upload_Converter SHALL restrict the upload and confirm functionality to users with QC or Admin roles.
2. WHILE a user with Operator or PPIC role is viewing the floor plan page, THE Upload_Converter SHALL hide the upload button.
3. WHEN an unauthorized user attempts to access the upload endpoint directly, THE Upload_Converter SHALL return an access denied response.
