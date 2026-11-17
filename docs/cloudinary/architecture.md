# Accero PrintPortal — Cloudinary Architecture & Asset Engineering

## 1. Architectural Overview

Accero PrintPortal migrated its media storage and delivery architecture from legacy MongoDB binary/base64 inline storage to a decoupled, high-performance Cloudinary + Sharp + Next.js architecture.

```
+---------------------------------------------------------------------------------+
|                               ACCERO CLIENT                                     |
|  - CardForm (Studio) / AssetDropzone / CloudinaryImage                          |
|  - Instant Zero-Latency Canvas Feedback via Local Preview                       |
+---------------------------------------------------------------------------------+
                                       |
                                       | (Multipart / JSON via POST /api/media/upload)
                                       v
+---------------------------------------------------------------------------------+
|                           NEXT.JS APP SERVER (Node.js)                          |
|                                                                                 |
| 1. Authentication & RBAC Guard:                                                 |
|    - Validates user session token via getSession()                              |
|                                                                                 |
| 2. File & Content Security Validation:                                          |
|    - Inspects magic bytes (FF D8 FF for JPEG, 89 50 4E 47 for PNG, RIFF/WEBP)    |
|    - Enforces 10MB file-size ceiling                                            |
|    - Rejects vector SVGs, executables, scripts, and malformed files             |
|                                                                                 |
| 3. Sharp Image Preprocessing & Compression Engine:                              |
|    - Automatically normalizes EXIF orientation via .rotate()                    |
|    - Strips GPS EXIF and camera metadata to protect citizen privacy             |
|    - Applies calibrated compression profiles (Avatar, Marketing, Doc, Sig)      |
|    - High-DPI preservation for physical PVC card printer trays (300+ DPI)       |
|                                                                                 |
| 4. Cloudinary Node SDK Authenticated Stream:                                    |
|    - Assigns opaque, PII-shielded UUID public ID                                |
|    - Enforces multi-environment folder hierarchy (accero/{env}/...)             |
|    - Uploads compressed buffer to Cloudinary API                                |
+---------------------------------------------------------------------------------+
          |                                                       |
          | (Store Asset Reference & Metadata)                    | (Authenticated Upload)
          v                                                       v
+-----------------------------------+       +------------------------------------+
|         MONGODB ATLAS             |       |        CLOUDINARY CLOUD CDN        |
|                                   |       |                                    |
| - publicId: "accero/prod/..."     |       | - Encrypted Multi-Region Storage   |
| - secureUrl: "https://res..."     |       | - Dynamic f_auto / q_auto Delivery |
| - width, height, bytes, format    |       | - Private Signed URLs (s--...--)   |
| - ZERO Base64 strings in new docs |       | - Immediate Cache Invalidation     |
+-----------------------------------+       +------------------------------------+
```

---

## 2. Cloudinary Folder Hierarchy

All assets are strictly organized by environment lane (`production`, `development`, `test`) to prevent cross-environment asset pollution:

```
accero/
│
├── production/
│   │
│   ├── users/
│   │   ├── profiles/           # User profile headers & logos
│   │   └── avatars/            # Operator avatar images (Profile A)
│   │
│   ├── services/
│   │   ├── pan/                # PAN applicant portrait photos
│   │   ├── aadhaar/            # Aadhaar resident photos
│   │   ├── voter/              # Voter elector photos
│   │   ├── driving-license/    # Driving licence driver portraits
│   │   ├── vehicle-rc/         # Vehicle smart-card badges
│   │   ├── ration-card/        # Head of family portraits
│   │   └── farmer-id/          # Farmer scheme applicant portraits
│   │
│   ├── documents/
│   │   ├── uploads/            # General user document attachments
│   │   ├── photographs/        # Uncategorized identity photographs
│   │   ├── signatures/         # Cardholder & officer signatures
│   │   └── generated-previews/ # Rendered card front & back sheets
│   │
│   ├── marketing/
│   │   ├── banners/            # Homepage hero banners & CTA assets
│   │   ├── blog/               # SEO technical guides & article illustrations
│   │   ├── thumbnails/         # Social OpenGraph & Twitter preview images
│   │   └── illustrations/      # Vector-converted UI service graphics
│   │
│   └── temporary/              # Ephemeral test & verification artifacts
│
└── development/
    └── [Mirrored structure for local testing & staging]
```

---

## 3. Public vs. Private Asset Security

### Public Assets
- **Examples:** Marketing banners, blog illustrations, public service graphics, operator guide graphics.
- **Delivery Strategy:** Delivered via high-speed global CDN using clean URLs with Cloudinary automatic format (`f_auto`) and quality (`q_auto`) transformations.
- **Caching:** Aggressive edge CDN caching enabled with immutable cache headers.

### Private Citizen Assets (CR80 PVC Cards)
- **Examples:** Aadhaar resident photographs, PAN applicant portraits, Voter ID elector photos, Driving licence driver photos, cardholder handwritten signatures, rendered document sheets.
- **Security Protections:**
  1. **Zero PII in Public IDs:** Asset public IDs never contain citizen names, Aadhaar numbers, PAN numbers, or EPIC identifiers. Every asset is named with a cryptographically random UUID (`crypto.randomUUID()`).
  2. **Metadata Stripping:** Sharp strips all GPS coordinates, camera hardware information, and device timestamps upon upload.
  3. **Signed Access URLs:** Private assets are flagged with `type: 'authenticated'`. Delivery URLs are cryptographically signed (`s--<signature>--`) with expiration windows to prevent search engine indexing, scraping, and hotlinking.
  4. **Ownership Enforcement:** APIs verify session ownership before serving signed delivery references.

---

## 4. Sharp Server-Side Image Preprocessing

Before any asset reaches Cloudinary, it is preprocessed server-side using `sharp`:

| Profile | Target Width x Height | Target Format | Quality | Fit Mode | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Profile A (Avatar)** | 512 × 512 | WebP | 80 | `cover` | Operator profile avatars |
| **Profile B (Marketing)** | 1920 × 1920 | WebP | 82 | `inside` | Banners, landing page heroes |
| **Profile C (Blog)** | 1600 × 1200 | WebP | 82 | `inside` | Technical guides & articles |
| **Profile D (Document Photo)** | 1200 × 1500 | Preserve (JPEG) | 92 | `inside` | PVC card portrait photos (300+ DPI) |
| **Profile D2 (Signature)** | 1000 × 400 | Preserve (PNG) | 95 | `inside` | Signatures (preserves transparency) |
| **Profile E (Temporary Preview)**| 1000 × 638 | WebP | 78 | `inside` | Compact rendered card previews |

### Document Integrity Guarantee
Identity document photographs and signatures are never aggressively downsampled or converted into lossy formats that impair physical PVC card printing (ISO/IEC 7810 ID-1 standard: 85.60 mm × 53.98 mm) or hinder barcode/QR code scanners.

---

## 5. Atomic Asset Replacement & Durable Cleanup Queue

Accero PrintPortal guarantees data safety during photograph and signature changes via a strict 12-step atomic lifecycle:

```
[User Selects New Photo]
       │
       ▼
[Validate & Process via Sharp] ───► Fails? ──► Abort. Existing asset untouched.
       │
       ▼
[Upload New Image to Cloudinary] ─► Fails? ──► Abort. Existing asset untouched.
       │
       ▼
[Verify Asset Exists on Cloudinary] ──► Fails? ──► Abort. Existing asset untouched.
       │
       ▼
[Persist Metadata to MongoDB] ────► Fails? ──► Abort. Existing asset untouched.
       │
       ▼
[Verify Reference Isolation] ─────► Shared by another doc? ──► Skip deletion.
       │
       ▼
[Delete Old Asset from Cloudinary]
       │
       ├─► Success ──► Asset deleted; CDN cache invalidated.
       └─► Failure ──► Enqueue to AssetCleanupQueue for exponential-backoff retry.
```

### Reference Isolation (`isAssetReferencedElsewhere`)
Before an asset is deleted, the system queries both `DocumentRecord` and `User` to verify that no other record references the same `publicId`. If an asset is shared across family cards or linked documents, deletion is safely skipped (`SKIPPED_REFERENCED`).

---

## 6. Installed Cloudinary Skills Alignment

The architecture strictly adheres to the official Cloudinary skill specifications bundled in `~/.agents/skills/`:

1. **`cloudinary-docs`**: Informs authenticated asset delivery (`type: 'authenticated'`), HMAC-SHA1 signed URL generation (`sign_url: true`), and Admin API resource inspection.
2. **`cloudinary-next`**: Directs Next.js App Router server/client component boundaries (`'use client'`, `runtime = 'nodejs'`), ensuring `CLOUDINARY_API_SECRET` is strictly isolated from `NEXT_PUBLIC_*` client bundles.
3. **`cloudinary-react`**: Governs `CldImage` vs `<img>` rendering, ensuring pre-signed URLs bypass client-side signature stripping and enforcing `crossOrigin="anonymous"` for canvas exports.
4. **`cloudinary-transformations`**: Governs format and quality optimization (`f_auto/q_auto`) while maintaining uncompromised master resolution for physical PVC tray printing (300+ DPI).
5. **`cloudinary-upload`**: Defines authenticated stream upload patterns (`upload_stream`), Buffer streaming via `Readable.from()`, and PII-shielded UUID public ID paths.
6. **`cloudinary-video`**: Audited to confirm zero video dependencies in the document card printing stack.
