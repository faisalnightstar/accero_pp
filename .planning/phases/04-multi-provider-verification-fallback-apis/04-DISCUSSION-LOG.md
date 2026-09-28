# Phase 4: Multi-Provider Verification & Fallback APIs - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-28
**Phase:** 04-multi-provider-verification-fallback-apis
**Areas discussed:** API Provider Routing & Cascading Fallback, Verification Entry Point & Studio Transition, Timeout & Error Interception Policy

---

## API Provider Routing & Cascading Fallback

### Provider Cascade Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Automatic Silent Cascade | Try primary provider first (e.g., FastNexora for Voter, NeoAPI for PAN, AxenAPI for DL/RC); if it fails or times out, seamlessly attempt secondary provider before handing off to Studio | ✓ |
| Single Provider with Instant Fallback | Query only the configured primary provider; on failure/timeout, immediately route user into Split-Screen Studio with partial or blank data | |
| Manual Provider Switcher | Provide an optional UI dropdown allowing users or admins to explicitly choose which vendor gateway to query | |

**User's choice:** Automatic Silent Cascade
**Notes:** Seamless failover between providers ensures high availability without manual user friction.

### Captcha Handling Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Direct Non-Captcha Priority | Prioritize direct lookup providers (FastNexora for Voter). If direct provider fails and fallback requires captcha, attempt server-side auto-resolution or gracefully fallback to Studio manual entry | ✓ |
| Interactive Captcha Modal | If a fallback provider (like NeoAPI Voter) requires a captcha, show a quick captcha challenge dialog to the user before routing to Studio | |
| Strict Direct-Only | Only support providers that do not require interactive captcha; never prompt the user with captcha hurdles | |

**User's choice:** Direct Non-Captcha Priority
**Notes:** Never interrupt user workflow with interactive captcha screens unless unavoidable.

---

## Verification Entry Point & Studio Transition

### Lookup UI Entry Point
| Option | Description | Selected |
|--------|-------------|----------|
| Dual Entry Points (Dashboard Quick Lookup Modal + In-Studio Search Bar) | Users can search from the Dashboard (auto-navigating to Studio with pre-populated canvas) OR query directly inside the Studio workspace | ✓ |
| In-Studio Search Bar Only | Keep all lookup input controls directly inside `/studio` above the document form, keeping the Dashboard clean and summary-focused | |
| Dedicated Verification Portal Page | Create a standalone `/verify` lookup page where users enter any document number and preview raw API records before sending to Studio | |

**User's choice:** Dual Entry Points
**Notes:** Gives users flexibility from both the high-level dashboard and the in-depth studio editor.

### Studio State Replacement Policy
| Option | Description | Selected |
|--------|-------------|----------|
| Confirm Before Overwriting Dirty Forms | If user already has manual edits or uploaded photos in Studio, prompt for confirmation before replacing; if blank/clean, populate immediately | ✓ |
| Smart Merge (Preserve Manual Inputs) | Automatically keep existing manually uploaded photos/signatures or custom edits, and populate only the blank fields from the API record | |
| Always Overwrite Silently | Immediately overwrite all fields with the new API response without confirmation prompt | |

**User's choice:** Confirm Before Overwriting Dirty Forms
**Notes:** Protects against accidental data loss when users already invested effort typing or uploading assets.

---

## Timeout & Error Interception Policy

### API Timeout Threshold
| Option | Description | Selected |
|--------|-------------|----------|
| 8-Second Fast Timeout per Provider | Abort request after 8s, immediately trigger secondary fallback (or Studio handoff) so total wait time never exceeds ~15s | ✓ |
| 15-Second Relaxed Timeout | Allow up to 15s per provider to accommodate slow government portal response times before failing over | |
| 5-Second Aggressive Timeout | Fail fast after 5s to keep UI snappy and prioritize immediate manual entry in Studio | |

**User's choice:** 8-Second Fast Timeout per Provider
**Notes:** Balances waiting for slow third-party servers against keeping the application responsive.

### Error Notification Style
| Option | Description | Selected |
|--------|-------------|----------|
| Toast Notification + Amber Missing Field Banners | Route seamlessly into Studio with whatever data was retrieved, display a non-blocking toast alert, and activate existing Studio amber badges on missing fields | ✓ |
| Informative Transition Modal | Show a brief dialog explaining 'External API lookup completed with partial data' with a 'Complete in Studio' confirmation button | |
| Silent Entry with Studio Banners Only | No popup or toast; smoothly open Studio and rely purely on the existing MissingFieldBanner and field highlights | |

**User's choice:** Toast Notification + Amber Missing Field Banners
**Notes:** Smooth non-blocking transition highlighting missing fields for rapid manual completion.

---

## the agent's Discretion

- Mock/simulation mode fallback when API keys are not supplied.
- Internal error logging format and HTTP client abstraction.

## Deferred Ideas

- UPI QR Payment Gateway for wallet balance top-ups (Phase 5).
- Bulk CSV Document Lookup (v2).
- Optical Character Recognition (OCR) for photo scans (v2).
