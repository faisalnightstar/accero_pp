# Phase 3: Interactive Split-Screen Studio & Missing Field Editor - Research

**Phase:** 03-interactive-split-screen-studio-missing-field-editor
**Domain:** Dual-Pane Reactive Studio Architecture, Missing-Field Detection Engine, Live Two-Way Data Synchronization, Drag-and-Drop Asset Ingestion, and MongoDB Document Record Persistence
**Researched:** 2026-09-28
**Confidence:** HIGH

---

## 1. Split-Screen Studio Layout Architecture

### Dual-Pane Responsive Layout Pattern
- **Problem:** Operators need to inspect the live physical card preview while filling or editing form fields without context switching or modal popups.
- **Solution:** A dual-pane flex/grid layout:
  - **Left Pane (45% - 50% width on Desktop):** Form editor with tabbed sections (Basic Details, Regional/Bilingual, Address, Photo & Signature). Features sticky summary header with completion progress bar and quick-action navigation.
  - **Right Pane (50% - 55% width on Desktop):** Sticky viewport (`sticky top-20`) hosting the `Cr80CardContainer` with active vector card canvas (`PanCardCanvas`, `AadhaarCardCanvas`, `VoterCardCanvas`, `DlCardCanvas`, `RcCardCanvas`).
  - **Responsive Collapse on Mobile/Tablet (`<lg`):** Vertical stack with a floating collapsible mini-preview or bottom drawer that can expand to full card preview.

---

## 2. Missing-Field Detection Engine & Visual Cue System

### Core USP: "Zero Missing-Data Failures"
External government APIs (Parivahan, ECI, NSDL, UIDAI third-party aggregators) frequently return incomplete payloads:
- Missing father/husband names
- Missing regional language translations (e.g., Hindi Devanagari names or addresses)
- Missing dates of birth (only age returned)
- Missing or low-resolution photo/signature images
- Missing chassis/engine numbers or financier data

### Detection Rules Specification
A declarative schema per document type defines required vs optional fields:

```typescript
export interface FieldRule {
  key: string;
  label: string;
  required: boolean;
  section: 'identity' | 'demographics' | 'address' | 'technical' | 'media';
  validate?: (val: any) => boolean;
}
```

- **Metrics Calculation:**
  - `totalFields`: count of required fields for document type.
  - `missingFields`: array of keys that are empty, null, or undefined.
  - `completionScore`: `Math.round(((totalFields - missingFields.length) / totalFields) * 100)`.
  - `isPrintReady`: `missingFields.length === 0`.

### Visual Cues:
1. **In Form Editor:**
   - Amber warning badge on input label: `⚠️ Missing from API`.
   - Glowing amber border (`border-amber-400 focus:border-amber-500 bg-amber-50/20`).
   - "Next Missing Field" floating CTA button to jump directly to the first incomplete field.
2. **On Card Canvas:**
   - Incomplete elements render with dashed amber outline and placeholder text: `[Missing: Father Name]`.
   - Photo and signature slots display dashed dropzone prompts when empty.

---

## 3. Real-Time Two-Way State Synchronization

- **State Management:** Controlled form state hook (`useCardStudio`) managing:
  - `docType`: `'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc'`
  - `cardData`: active document data payload
  - `originalData`: initial snapshot from API lookup or manual blank template for reset
  - `dirtyFields`: Set of modified keys
  - `isSaving`: boolean
- **Latency Guarantee:** Direct in-memory state updates ensure 0ms latency between keystrokes in form inputs and visual vector text updates on the canvas.

---

## 4. Drag-and-Drop Photo & Signature Asset Uploads

- **Client Dropzone:** Custom lightweight drag-and-drop file upload component (`AssetDropzone.tsx`):
  - Supports drag over, click to browse, and paste from clipboard.
  - Instant client-side base64 conversion via `FileReader.readAsDataURL()`.
  - Image size validation (max 5MB) and type validation (`image/jpeg`, `image/png`, `image/webp`).
  - Integrated "Remove / Re-upload" and aspect ratio guide (35mm × 45mm for photo, 60mm × 20mm for signature).

---

## 5. Document Persistence Pipeline (`DocumentRecord` MongoDB)

- **Schema:** Utilizes existing `src/models/DocumentRecord.ts`:
  - `userId`: ObjectId of authenticated user
  - `docType`: Document type enum (`pan`, `aadhaar`, `voter`, `dl`, `rc`)
  - `docNumber`: Identifier (PAN, Aadhaar, EPIC, DL, RC)
  - `status`: `'draft' | 'completed' | 'printed'`
  - `data`: Complete document payload JSON
  - `metadata`: `{ completionScore, missingFieldsFixed, printedAt, clientIp }`
- **Endpoints:**
  - `POST /api/documents`: Create or update document record.
  - `GET /api/documents`: Paginated list of user's saved records with filter by `docType`.
  - `GET /api/documents/[id]`: Load saved record back into the studio for re-editing or re-printing.
