# Phase 3: Interactive Split-Screen Studio & Missing Field Editor - Validation

**Phase:** 03-interactive-split-screen-studio-missing-field-editor
**Domain:** Split-Screen Studio, Missing Field Detection, Real-Time Binding & Persistence Verification
**Date:** 2026-09-28
**Status:** READY

---

## 1. Validation Criteria Matrix

| Req ID | Description | Validation Method | Success Threshold |
|---|---|---|---|
| **STUDIO-01** | Dual-pane split-screen studio layout | Visual inspection across viewport breakpoints | Desktop displays form on left, sticky card canvas on right; mobile collapses cleanly |
| **STUDIO-02** | Automatic missing-field detection | Mock payload injection with omitted fields | Missing fields trigger amber warning badges, completion score reflects percentage, canvas shows dashed guides |
| **STUDIO-03** | Real-time two-way synchronization | Keystroke latency test in input fields | Keystrokes instantly reflect on corresponding live vector card text with zero perceptible delay (<16ms) |
| **STUDIO-04** | Manual entry & asset drag-and-drop | File drop test with photo & signature images | Dropping JPEG/PNG files converts to base64 and renders inside card photo and signature boxes immediately |
| **STUDIO-05** | Document persistence in MongoDB | API test `POST /api/documents` and query verify | Record saved in `DocumentRecord` collection with full payload, status, and metadata; reloads correctly via ID |

---

## 2. Automated & Compile-Time Checks

- **TypeScript Compilation:**
  ```bash
  npm run build
  ```
  Must compile with zero TypeScript errors under strict mode (`strict: true`). All form schemas, validation rule types, and API payload handlers must be fully typed.
- **Linting:**
  ```bash
  npm run lint
  ```
  Must pass cleanly with no ESLint warnings.

---

## 3. Studio Interactive Verification Procedures

1. **Missing Field Highlighting:**
   - Load a sample Voter ID with omitted Father Name and missing Regional Address.
   - Confirm the Studio displays amber banner: `⚠️ 2 Missing Fields Detected`.
   - Confirm clicking "Fix Next Missing Field" scrolls and focuses the first empty input.
2. **Two-Way Synchronization:**
   - Type in "Father Name" input field.
   - Confirm the card canvas instantly updates the father's name on both Front and Back previews.
3. **Asset Ingestion:**
   - Drag and drop a photo into the Photo dropzone.
   - Confirm photo appears immediately on the card canvas inside the photo boundary.
4. **Save and Persistence:**
   - Click "Save Document to Portal".
   - Confirm API returns `201 Created` with saved document ID.
   - Navigate to user documents list or reload `/studio?id=<docId>` to verify data persistence.
