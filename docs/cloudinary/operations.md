# Accero PrintPortal — Cloudinary Operations & Maintenance Guide

## 1. Environment Variables Reference

Configure these variables in your deployment environment (Vercel Project Settings):

```bash
# ==============================================================================
# CLOUDINARY MEDIA & ASSET STORAGE
# ==============================================================================

# Server-Side Authenticated Credentials (CRITICAL: NEVER expose to client bundles)
CLOUDINARY_CLOUD_NAME=acceroprintportal
CLOUDINARY_API_KEY=271149434195136
CLOUDINARY_API_SECRET=********************************

# Unified Connection String Alternative (Optional)
# CLOUDINARY_URL=cloudinary://271149434195136:SECRET@acceroprintportal

# Public Client-Side Cloud Name (Safe to expose in browser for next-cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=acceroprintportal
```

### Security Operational Rules
1. Never commit `.env` or files containing `CLOUDINARY_API_SECRET` to GitHub.
2. The server configuration module (`src/lib/cloudinary/config.ts`) includes an automatic build-time guard that throws if executed in a browser context.
3. If an API key or secret is accidentally exposed, immediately rotate it at:
   [Cloudinary Console — Settings → API Keys](https://console.cloudinary.com/settings/api-keys)

---

## 2. Operational Limits & Request Ceilings

| Parameter | Limit | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Max Image Upload Size** | 10 MB | Enforced in `image-validation.ts` via Buffer byte length check |
| **Allowed Raster Formats** | JPEG, PNG, WebP | Magic byte verification (`validateImageMagicBytes`) |
| **Vector SVG Uploads** | Blocked | Rejected to eliminate XSS / XML External Entity vulnerabilities |
| **Document Photo DPI** | 300+ DPI Equivalent | 1200 × 1500 px ceiling with quality 92 (ISO/IEC 7810 ID-1 standard) |
| **Signature Dimensions** | 1000 × 400 px | Preserves PNG alpha transparency |
| **Upload Rate Limit** | 60 requests / min | Enforced via `@upstash/ratelimit` / MongoDB sliding-window limiter |

---

## 3. Asset Management & Lifecycle

### Automated Asset Deletion
When an operator deletes a saved document from the portal:
`DELETE /api/documents/[id]`
The API asynchronously triggers:
- `deleteImageFromCloudinary(publicId, { type: 'authenticated' })`
- `deleteImageFromCloudinary(signatureId, { type: 'authenticated' })`
- `deleteImageFromCloudinary(frontPreviewId, { type: 'authenticated' })`
- Immediately dispatches CDN invalidation (`invalidate: true`) to purge Cloudinary edge cache.

### Automated Asset Replacement & Safe Deletion Lifecycle
When an operator or citizen replaces an existing photograph or signature:
1. The new image is processed and uploaded to Cloudinary.
2. The MongoDB record (`DocumentRecord` or `User`) is updated and confirmed saved.
3. Only after confirmed persistence is the old asset deleted via `executeSafeAssetCleanup()`.
4. If deletion fails (e.g. temporary API timeout or network partition), the asset is enqueued into `AssetCleanupQueue` in MongoDB with status `PENDING`.
5. The background processor `processAssetCleanupQueue()` automatically retries with exponential backoff:
   ```bash
   # Can be executed via API or scheduled task
   curl -s -X POST "https://printportal.accero.app/api/admin/maintenance/cleanup-queue" \
     -H "Authorization: Bearer ${ADMIN_TOKEN}"
   ```

### Temporary Asset Cleanup
Test uploads and verification artifacts are routed to:
`accero/{env}/temporary`
A recurring maintenance task can purge all assets in the `temporary` folder older than 24 hours via the Cloudinary Admin API:
```bash
# Cloudinary Admin API bulk delete by prefix
curl -s -X DELETE "https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload?prefix=accero/production/temporary" \
  -u "${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}"
```

---

## 4. Cost & Bandwidth Optimization Principles

1. **Pre-Upload Server-Side Compression:**
   Because all assets are compressed with Sharp *before* transmission to Cloudinary, incoming storage bandwidth and storage credits are minimized by 70%–97%.
2. **Strict Folder Partitioning:**
   Prevents unnecessary transformation credit consumption.
3. **Dynamic CDN Format (`f_auto, q_auto`):**
   Cloudinary automatically serves AVIF to Chrome/Edge, WebP to Safari/Firefox, and JPEG to legacy clients, ensuring minimal egress bandwidth.
4. **Cache Header Optimization:**
   Public marketing assets are served with immutable, long-lived cache headers (`max-age=31536000, immutable`).

---

## 5. Troubleshooting & Diagnostics

### Issue 1: "Unsupported image format" on Upload
- **Cause:** User uploaded an SVG file, a corrupted image, or a file with a spoofed `.jpg` extension that does not match authentic JPEG magic bytes (`FF D8 FF`).
- **Resolution:** Advise the operator to take a fresh photo or export standard PNG/JPEG from their scanner software.

### Issue 2: "Signature asset not found on Cloudinary"
- **Cause:** Asset was uploaded as `authenticated` but accessed via an unauthenticated URL.
- **Resolution:** Use `generateSignedDeliveryUrl(publicId)` which appends the required cryptographic signature.

### Issue 3: html2canvas Tainted Canvas Error During PDF Export
- **Cause:** Missing `crossOrigin="anonymous"` on `<img />` tags rendering remote Cloudinary assets.
- **Resolution:** All card canvases in `src/components/cards/*.tsx` have been updated with `crossOrigin="anonymous"`. Ensure any custom cards also use `CloudinaryImage.tsx` or set `crossOrigin="anonymous"`.
