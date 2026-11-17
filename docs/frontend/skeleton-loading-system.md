# Accero PrintPortal — Centralized Skeleton Loading System Architecture

## 1. Executive Summary

The Accero PrintPortal Skeleton Loading System provides a unified, production-grade visual loading state architecture across all routes, layouts, cards, tables, dashboards, and asynchronous operations. Engineered specifically for high-throughput Indian document service operators, CSC VLEs, and Jan Seva Kendra centers, this system eliminates layout shifts (CLS = 0), prevents false ₹0 wallet balance flashes, and guarantees WCAG 2.1 AA accessibility compliance.

---

## 2. Design Principles & Performance Standards

1. **Zero Cumulative Layout Shift (CLS = 0):** Every skeleton component mirrors the exact height, padding, border radius, and aspect ratios of the real component it stands for. For document studios, the skeleton strictly conforms to the **ISO/IEC 7810 ID-1 standard CR80 card aspect ratio** ($85.60\text{ mm} \times 53.98\text{ mm} \approx 1.586$).
2. **Accessible by Default:** Every skeleton container and element is annotated with `role="status"`, `aria-busy="true"`, `aria-live="polite"`, and screen-reader accessible `sr-only` fallback text (`"Loading..."`).
3. **Motion Sensitivity:** Shimmer and pulse animations strictly respect operating system accessibility settings via `motion-reduce:animate-none`. When reduced motion is preferred, static subdued background tints are rendered without motion.
4. **CSS-Only Animation:** Uses Tailwind CSS `animate-pulse` driven by the browser's GPU compositor, avoiding JavaScript `setInterval` or CPU-heavy re-renders.
5. **Dark & Light Mode Harmony:** Skeletons utilize semantic theme tokens (`bg-slate-200 dark:bg-slate-800`, `bg-slate-900 border-slate-800`), matching both dark operator control centers and clean light printable workspaces.
6. **No False Data Flashes:** Asynchronous financial components never display a misleading `₹0.00` while data is loading; they render dedicated monetary shimmer blocks until authoritative figures arrive from MongoDB.

---

## 3. Component Architecture & System Inventory

### 3.1. Central Primitive: `src/components/ui/skeleton.tsx`
The atomic foundation for all loading states:
```tsx
import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 motion-reduce:animate-none ${className}`}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

### 3.2. Specialized Domain Skeletons: `src/components/skeletons/`
| Skeleton Component | Source File | Purpose & UI Shape | Key Props / Variants |
| :--- | :--- | :--- | :--- |
| `CardSkeleton` | `src/components/skeletons/CardSkeleton.tsx` | Metric stat cards, service cards, and compact info cards | `variant="stat" \| "service" \| "compact"` |
| `TableSkeleton` | `src/components/skeletons/TableSkeleton.tsx` | Data tables with responsive columns, headers, and actions | `rows` (def 5), `columns` (def 4), `showHeader`, `hasActions` |
| `DashboardSkeleton` | `src/components/skeletons/DashboardSkeleton.tsx` | Complete VLE dashboard with banner, 4 metrics, service grid, and saved records table | Full page container layout |
| `WalletSkeleton` | `src/components/skeletons/WalletSkeleton.tsx` | Financial overview, balance card, recharge preset chips, and audit ledger | Full ledger layout |
| `DocumentSkeleton` | `src/components/skeletons/DocumentSkeleton.tsx` | CR80 card canvas ($1.586$ aspect ratio), split form editor, and upload dropzones | `splitView` (boolean) |
| `FormSkeleton` | `src/components/skeletons/FormSkeleton.tsx` | Input fields, label placeholders, and submit action buttons | `fields`, `columns` (1 \| 2), `hasSubmitButton` |
| `ChartSkeleton` | `src/components/skeletons/ChartSkeleton.tsx` | Financial throughput & print volume bar charts with deterministic heights | `height`, `bars` |
| `ProfileSkeleton` | `src/components/skeletons/ProfileSkeleton.tsx` | User profile avatar, business center details, and security credentials | Multi-card grid |
| `ListSkeleton` | `src/components/skeletons/ListSkeleton.tsx` | Ticket queue, activity feeds, notifications, and knowledge base lists | `items`, `hasHeader` |
| `DetailSkeleton` | `src/components/skeletons/DetailSkeleton.tsx` | Inspection drawers, audit logs, and transaction detail modals | Key-value pairs and tag chips |
| `PageSkeleton` | `src/components/skeletons/PageSkeleton.tsx` | Generic top-level layout fallback | `variant="cards" \| "table" \| "simple"` |

---

## 4. Route-by-Route Loading Coverage Inventory

All major application routes utilize Next.js App Router route segment `loading.tsx` conventions. This ensures instant feedback during page transitions and server action processing while keeping navigation shells intact:

| Route Path | Loading Boundary File | Skeleton Implementation | Layout Preservation |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `src/app/dashboard/loading.tsx` | `<DashboardSkeleton />` | Retains global navigation & top bar |
| `/wallet` | `src/app/wallet/loading.tsx` | `<WalletSkeleton />` | Retains navigation, shows balance & ledger skeletons |
| `/cards` | `src/app/cards/loading.tsx` | `<DocumentSkeleton splitView={true} />` | Retains studio preview shell |
| `/studio` | `src/app/studio/loading.tsx` | `<DocumentSkeleton splitView={true} />` | Matches split-screen canvas and form editor |
| `/dashboard/pan-lookup` | `src/app/dashboard/pan-lookup/loading.tsx` | `<PanLookupLoading />` | Search inputs, history table skeleton |
| `/dashboard/offers` | `src/app/dashboard/offers/loading.tsx` | `<OffersLoading />` | Service cards grid skeleton |
| `/dashboard/promo-codes` | `src/app/dashboard/promo-codes/loading.tsx` | `<DashboardPromoCodesLoading />` | Promo codes table skeleton |
| `/dashboard/refer-earn` | `src/app/dashboard/refer-earn/loading.tsx` | `<ReferEarnLoading />` | Referral stats and history table |
| `/admin` | `src/app/admin/loading.tsx` | `<AdminLoading />` | **Preserves persistent dark admin sidebar (`w-64`)** |
| `/admin/finance` | `src/app/admin/finance/loading.tsx` | `<AdminFinanceLoading />` | Financial stat cards and ledger table |
| `/admin/operators` | `src/app/admin/operators/loading.tsx` | `<AdminOperatorsLoading />` | Operator search bar & operator records table |
| `/admin/payments` | `src/app/admin/payments/loading.tsx` | `<AdminPaymentsLoading />` | Payment transaction records table |
| `/admin/promo-codes` | `src/app/admin/promo-codes/loading.tsx` | `<AdminPromoCodesLoading />` | Promo code configuration matrix |
| `/admin/referrals` | `src/app/admin/referrals/loading.tsx` | `<AdminReferralsLoading />` | Referral program throughput table |
| `/admin/services` | `src/app/admin/services/loading.tsx` | `<AdminServicesLoading />` | Service fee configuration table |
| `/support` | `src/app/support/loading.tsx` | `<SupportLoading />` | Support overview cards and ticket feed |
| `/support/tickets` | `src/app/support/tickets/loading.tsx` | `<SupportTicketsLoading />` | Search bar and ticket queue table |

---

## 5. Component-Level & Asynchronous Integrations

### 5.1. Dashboard Page (`src/app/dashboard/page.tsx`)
- **Balance Card:** When `user` session is being fetched in the background, renders `<Skeleton className="h-12 w-44 rounded-xl bg-white/20" />` instead of flashing `₹0.00`.
- **Document Library:** Replaced the generic `Loader2` spinner with `<TableSkeleton rows={4} columns={4} showHeader={true} className="border-0 shadow-none" />`.

### 5.2. Wallet Page (`src/app/wallet/page.tsx`)
- **Available Balance & Summary Cards:** Cards 1 through 4 display exact dimension-matched skeleton blocks while `isLoading` is true.
- **Ledger Table:** Dynamically renders 6 structured table row skeletons during pagination or filtering transitions, preserving table columns, alignment, and headings.

### 5.3. Recharge Modal (`src/components/wallet/RechargeModal.tsx`)
- **Dynamic UPI QR Code:** Replaced the plain loader with a structured $48 \times 48$ ($192\text{px}$) matrix QR skeleton with scanner target corners and backdrop shimmer, eliminating modal layout jumps when generating Paytm orders.

### 5.4. Document Studio Asset Dropzone (`src/components/studio/AssetDropzone.tsx`)
- **Cloudinary Optimization:** Displays an animated shimmer overlay directly over the photo/signature preview box during compression and Cloudinary upload.

### 5.5. PAN Instant Lookup (`src/app/dashboard/pan-lookup/page.tsx`)
- **Result Panel:** Replaced static loader with an exact visual match of the verified PAN details card (Name, Father's Name, DOB, Aadhaar link status) during API queries.
- **Verification History:** Renders a 4-row table skeleton while historical queries are fetched.

---

## 6. Accessibility & Compliance Verification

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **ARIA Roles** | All skeleton roots carry `role="status"` | Verified |
| **ARIA Busy** | Active loading components set `aria-busy="true"` | Verified |
| **Screen Readers** | Hidden helper `<span className="sr-only">Loading...</span>` announces state | Verified |
| **Reduced Motion** | Tailwind `motion-reduce:animate-none` disables pulse for vestibular safety | Verified |
| **Color Contrast** | `bg-slate-200` (light) and `bg-slate-800` (dark) provide subtle, non-blinding contrast | Verified |

---

## 7. Automated Testing Suite

Two dedicated test suites verify the integrity and contracts of the skeleton system:
- **`tests/skeletons/skeleton-primitives.test.ts` (15 tests):**
  - Verifies DOM output of `Skeleton`, `CardSkeleton`, `TableSkeleton`, `FormSkeleton`, `DocumentSkeleton`, `WalletSkeleton`, `DashboardSkeleton`, `ChartSkeleton`, `ProfileSkeleton`, `ListSkeleton`, `DetailSkeleton`, and `PageSkeleton`.
  - Asserts presence of `role="status"`, `aria-busy="true"`, `animate-pulse`, and `motion-reduce:animate-none`.
  - Asserts ISO CR80 aspect ratio `aspect-[1.586]` in `DocumentSkeleton`.
- **`tests/skeletons/route-loading.test.ts` (34 tests):**
  - Confirms physical existence on disk of all 17 route `loading.tsx` files.
  - Renders each `loading.tsx` component to static HTML markup cleanly without exceptions.

Run the test suite with:
```bash
npx vitest run tests/skeletons/
```
Output:
```
✓ tests/skeletons/skeleton-primitives.test.ts (15 tests)
✓ tests/skeletons/route-loading.test.ts (34 tests)
Test Files  2 passed (2)
Tests       49 passed (49)
```

---

## 8. Maintenance & Adding Skeletons to New Routes

When creating a new route segment (e.g. `src/app/tools/new-tool/`):
1. Create `src/app/tools/new-tool/loading.tsx`.
2. Import the appropriate specialized skeleton from `@/components/skeletons`:
   ```tsx
   import React from 'react';
   import { DocumentSkeleton } from '@/components/skeletons';

   export default function NewToolLoading() {
     return <DocumentSkeleton />;
   }
   ```
3. If building a custom data table or card grid, compose using `<TableSkeleton rows={n} columns={k} />` or `<CardSkeleton variant="stat" />`.
