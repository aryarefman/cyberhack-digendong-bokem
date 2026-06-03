import os
import re

file_path = r'c:\Users\Hikar\Documents\Kuliah\Lomba\CyberHack\cyberhack-digendong-bokem\frontend\src\app\(dashboard)\qc\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'AI vision inspection for plant and fruit raw materials': '{t(\"qcSubtitle\")}',
    '>Plant<': '>{t(\"qcPlant\")}<',
    '>Fruit<': '>{t(\"qcFruit\")}<',
    'Capture Material Image': '{t(\"qcCaptureImage\")}',
    'No image captured': '{t(\"qcNoImage\")}',
    'Start Camera': '{t(\"qcStartCamera\")}',
    'Stop Camera': '{t(\"qcStopCamera\")}',
    'Start Video': '{t(\"qcStartVideo\")}',
    'Upload File': '{t(\"qcUploadFile\")}',
    'Retake / Upload New': '{t(\"qcRetake\")}',
    'MATERIAL / BATCH ID': '{t(\"qcBatchId\")}',
    '\"Example: BATCH-2024-001 (Leave blank to auto-generate)\"': 't(\"qcBatchPlaceholder\")',
    'Start counting objects (auto detect and count moving objects)': '{t(\"qcStartCounting\")}',
    'Inspect with AI': '{t(\"qcInspectAI\")}',
    'Automatically save inspection results to database': '{t(\"qcAutoSave\")}',
    'Inspection Result': '{t(\"qcInspectionResult\")}',
    'No inspection results': '{t(\"qcNoResults\")}',
    'Capture material image and click \"Inspect with AI\"': '{t(\"qcCapturePrompt\")}',
    'CONFIDENCE LEVEL': '{t(\"qcConfidenceLevel\")}',
    'INSPECTION NOTES / REASON': '{t(\"qcNotesReason\")}',
    'Saved to database': '{t(\"qcSavedDb\")}',
    'Not saved': '{t(\"qcNotSaved\")}',
    'Submit Manual Inspection': '{t(\"qcSubmitManual\")}',
    'Interim Inspection Results': '{t(\"qcInterimResults\")}',
    'Total Objects:': '{t(\"qcTotalObjects\")}',
    '>Saving...<': '>{t(\"qcSaving\")}<',
    '>Save to Database<': '>{t(\"qcSaveDb\")}<',
    'Result:': '{t(\"qcResultText\")}',
    'Object:': '{t(\"qcObjectText\")}',
    'Confidence:': '{t(\"qcConfidenceText\")}',
    'Inspection History': '{t(\"qcHistory\")}',
    '>batches<': '>{t(\"qcBatches\")}<',
    '>Clear All<': '>{t(\"qcClearAll\")}<',
    'Delete all inspection records? This cannot be undone.': '{t(\"qcDeleteConfirm\")}',
    '>Deleting...<': '>{t(\"qcDeleting\")}<',
    '>Delete All<': '>{t(\"qcDeleteAll\")}<',
    '>Loading history...<': '>{t(\"qcLoadingHistory\")}<',
    '>Try Again<': '>{t(\"qcTryAgain\")}<',
    'No inspection records yet': '{t(\"qcNoHistory\")}',
    'MATERIAL ID': '{t(\"qcColMatId\")}',
    'TYPE': '{t(\"qcColType\")}',
    'RESULT': '{t(\"qcColResult\")}',
    'OBJECTS': '{t(\"qcColObjects\")}',
    'CONFIDENCE': '{t(\"qcColConfidence\")}',
    'NOTES': '{t(\"qcColNotes\")}',
    'DATE': '{t(\"qcColDate\")}'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced successfully.')
